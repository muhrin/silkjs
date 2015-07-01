/**
 * Created by uhrin on 05/06/15.
 */
define(["./util", "./event", "lib/gl-matrix"],
    function (util, event, glm) {
        'use strict';

        var Attributes = function () {
        };

        // Store information (metadata) about our attributes
        Object.defineProperty(Attributes.prototype, '_info',
            {
                configurable: false,
                enumerable: false,
                writable: true,
                value: {}
            });

        Attributes.prototype.getInfo = function (name) {
            return this._info[name];
        };

        Attributes.prototype._getAttributeObjectCreate = function (path, obj) {
            if (typeof obj === 'undefined') {
                obj = this;
            }
            if (path.length === 0) {
                // Reached the bottom of the path
                return obj;
            }
            // Have to go down the path
            var key = path.pop();
            if (!obj.hasOwnProperty(key)) {
                Object.defineProperty(obj, key,
                    {
                        configurable: false,
                        enumerable: true,
                        writable: true,
                        value: {}
                    });
            }
            return this._getAttributeObjectCreate(path, obj[key]);
        };

        Attributes.prototype._createPrivateAttribute =
            function (name, initialValue) {
                var privateName = "_".concat(name);
                Object.defineProperty(this, privateName,
                    {
                        configurable: false,
                        enumerable: false,
                        writable: true,
                        value: initialValue
                    });
                return privateName;
            };

        Attributes.prototype._add = function (name, descriptor, meta) {
            // Build up the attributes
            var leafName, path, attributesObject;

            path = name.split(".");
            leafName = path.pop();
            attributesObject = this._getAttributeObjectCreate(path.reverse());

            this._info[name] = meta;
            Object.defineProperty(attributesObject, leafName, descriptor);
        };


        /**
         * Represents a world object.
         *
         * @param {string} type - A string to identify this world object type
         * @param attributes - A dictionary of publicly exposed attributes that
         * this type of world object has.  The format is:
         * {
         *   [attribute name]: {
         *     value (optional): Initial value of the attribute
         *     type {string} (optional): The attribute type, can be one of
         *       WorldObject.ATTRIBUTE_TYPE or a custom type but then external
         *       views/controllers may not be able to display it.
         *   }
         * }
         * @constructor
         */
        var WorldObject = function (type, attributes) {
            // Pirvate properties
            this._type = type;
            this._parent = null;
            this._children = [];
            this._worldId = WorldObject.ORPHAN_ID;
            this._world = null;
            this._position = glm.vec3.create();
            this._rotation = glm.mat3.create();
            // Set up the attributes object
            //this._attributes = {};
            this._attributes = new Attributes();

            // Default attributes
            var attribs = {};
            // Merge attributes into the default attribs (will overwrite)
            util.merge(attributes, attribs);
            this.addAttributes(attribs);
        };

        // Static constant properties
        /**
         * @readonly
         * @enum {number}
         */
        WorldObject.EVENTS = {
            CHILD_ADDED: 0,
            CHILD_REMOVING: 1,
            POSITION_CHANGED: 2,
            ROTATION_CHANGED: 3,
            ATTRIBUTE_CHANGED: 4,
            ATTRIBUTE_ADDED: 5,
            ATTRIBUTE_REMOVED: 6,
            WORLD_INSERTED: 7,
            WORLD_REMOVING: 8
        };
        /**
         * @readonly
         * @enum {string}
         */
        WorldObject.ATTRIBUTE_TYPE = {
            STRING: "string",
            COLOR: "color",
            FLOAT: "float",
            INTEGER: "integer"
        };
        WorldObject.ORPHAN_ID = "orphan";
        WorldObject.TYPE = "world_object";

        // Static private methods
        WorldObject.prototype._insertChild = function (item) {
            var idx = this._children.push(item) - 1;
            item._insertedInto(this, idx);
            this._fireEvent(WorldObject.EVENTS.CHILD_ADDED,
                {childIndex: idx});
            return idx;
        };

        WorldObject.prototype._removeChild = function (item) {
            var idx = this._children.indexOf(item);
            if (idx !== -1) {
                this._fireEvent(WorldObject.EVENTS.CHILD_REMOVING,
                    {childIndex: idx});
                item._orphaned();
                this._children.splice(idx, 1);
            }
            return idx;
        };

        WorldObject.prototype._fireEvent = function (type, msg) {
            if (this.world()) {
                this.world()._doFireEvent(this, type, msg);
            }
        };

        WorldObject.prototype._makeAttributeGetter = function (key, owner) {
            return function () {
                return owner.attributes()[key];
            };
        };

        WorldObject.prototype._makeAttributeSetter = function (key, owner) {
            return function (value) {
                owner.attributes()[key] = value;
                owner._fireEvent(WorldObject.EVENTS.ATTRIBUTE_CHANGED,
                    {name: key.substring(1)});
            };
        };

        WorldObject.prototype.addAttribute = function (name, info) {
            // Build up the attributes
            var descriptor;
            if (typeof info.type === 'undefined') {
                info.type = 'string';
            }

            // Create the private variable to store the actual value
            var privateName =
                this._attributes._createPrivateAttribute(name, info.value);

            // Build up the descriptor for defineProperty call
            descriptor = {
                configurable: false,
                enumerable: true
            };
            // The getter
            descriptor.get = this._makeAttributeGetter(privateName, this);
            // The setter
            if (!info.readonly) {
                // Not readonly, so create a setter
                descriptor.set = this._makeAttributeSetter(privateName, this);
            }

            this.attributes()._add(name, descriptor, info);
            this._fireEvent(WorldObject.EVENTS.ATTRIBUTE_ADDED,
                {name: name});
        };

        WorldObject.prototype.removeAttribute = function (name) {
            delete this._attributes[name];
            this._fireEvent(WorldObject.EVENTS.ATTRIBUTE_REMOVED,
                {name: name});
        };

        WorldObject.prototype.addAttributes = function (attributes) {
            var name;
            for (name in attributes) {
                this.addAttribute(name, attributes[name]);
            }
        };

        WorldObject.prototype.removeAttributes = function (attributes) {
            var i;
            for (i = 0; i < attributes.length; ++i) {
                this.removeAttribute(attributes[i]);
            }
        };

        WorldObject.prototype.findAllChildren = function (type, results) {
            if (!results) {
                results = [];
            }
            if (this.type() === type) {
                results.push(this);
            }
            var i;
            for (i = 0; i < this._children.length; ++i) {
                this._children[i].findAllChildren(type, results);
            }
            return results;
        };

        // Public methods
        Object.defineProperties(WorldObject.prototype, {
            'position': {
                get: function () {
                    return this._position;
                },
                set: function (pos) {
                    var oldPos = this._position;
                    this._position = pos;
                    this._fireEvent(WorldObject.EVENTS.POSITION_CHANGED,
                        {old: oldPos});
                }
            },
            'rotation': {
                configurable: true,
                get: function () {
                    return this._rotation;
                },
                set: function (rot) {
                    var oldRot = this._rotation;
                    this._rotation = rot;
                    this._fireEvent(WorldObject.EVENTS.ROTATION_CHANGED,
                        {old: oldRot});
                }
            }
        });

        /**
         * Get the collection of this object's children.
         *
         * @returns {Array} This objects children
         */
        WorldObject.prototype.children = function () {
            return this._children;
        };

        /**
         * Get the index of a child of this object.
         *
         * @param child The child to find the index of
         * @returns {number} The child index or -1 if not found.
         */
        WorldObject.prototype.childIndex = function (child) {
            return this._children.indexOf(child);
        };

        /**
         * Get the type of this world object.
         *
         * @returns {string} The string identifying this world object type
         */
        WorldObject.prototype.type = function () {
            return this._type;
        };

        WorldObject.prototype.attributes = function () {
            return this._attributes;
        };

        /**
         * Get the world that this object is in.
         *
         * @returns {null|World} The world or null
         */
        WorldObject.prototype.world = function () {
            return this._world;
        };

        /**
         * Get the parent of this world object.
         *
         * @returns {null|WorldObject} The parent object or null
         */
        WorldObject.prototype.parent = function () {
            return this._parent;
        };

        WorldObject.prototype.addChild = function (item) {
            return this._insertChild(item);
        };

        WorldObject.prototype.removeChild = function (item) {
            return this._removeChild(item);
        };

        WorldObject.prototype.getChild = function (index) {
            return this._children[index];
        };

        WorldObject.prototype.getChildFromPath = function (path, offset) {
            var _offset = offset === undefined ? 0 : offset;
            if (path.length === offset) {
                return this;
            } else {
                return this.getChild(path[_offset]).getChildFromPath(path, _offset + 1);
            }
        };

        WorldObject.prototype.worldId = function () {
            return this._worldId;
        };

        WorldObject.prototype._insertedInto = function (parent, index) {
            this._parent = parent;
            this._updateId(index);
            if (parent.world()) {
                this._worldInserted(parent.world());
            }
        };

        WorldObject.prototype._updateId = function (index) {
            this._worldId = this._parent.worldId().concat(".", index);
            var i;
            for (i = 0; i < this._children.length; ++i) {
                this._children[i]._updateId(i);
            }
        };

        WorldObject.prototype._orphaned = function () {
            this._parent = null;
            this._worldId = WorldObject.ORPHAN_ID;
            if (this.world()) {
                this._worldRemoved();
            }
        };

        WorldObject.prototype._worldInserted = function (world) {
            if (this.world()) {
                throw new Error("Cannot insert into world, already in world.");
            }
            this._world = world;
            this._fireEvent(WorldObject.EVENTS.WORLD_INSERTED, {});
            this._children.forEach(function (child) {
                child._worldInserted(world);
            });
        };

        WorldObject.prototype._worldRemoved = function () {
            if (!this.world()) {
                throw new Error("Cannot remove from world, not in world.");
            }
            this._fireEvent(WorldObject.EVENTS.WORLD_REMOVING, {});
            this._world = null;
            var child;
            for (child in this._children) {
                child._worldRemoved();
            }
        };

        return WorldObject;
    });