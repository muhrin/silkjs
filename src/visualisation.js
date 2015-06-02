/**
 * Created by Martin Uhrin on 15/05/15.
 */
define(["silk/util", "silk/event", "gl-matrix"],
    function (util, event, glm) {
        'use strict';

        var my = {};

        my.WorldObject = function (type, attributes) {
            // Pirvate properties
            this._type = type;
            this._parent = null;
            this._children = [];
            this._worldId = my.WorldObject.ORPHAN_ID;
            this._world = null;
            this._position = glm.vec3.create();
            this._rotation = glm.mat3.create();
            this._attributes = {};
            var that = this;


            // Default attributes
            var attribs = {};
            // Merge attributes into the default attribs (will overwrite)
            util.merge(attributes, attribs);

            // Build up the attributes
            function makeAttributeGetter(key) {
                return function () {
                    return that._attributes[key];
                };
            }

            function makeAttributeSetter(key) {
                return function (value) {
                    that._attributes[key] = value;
                    that._fireEvent(my.WorldObject.EVENTS.ATTRIBUTE_CHANGED,
                        {name: key.substring(1)});
                };
            }

            var key, descriptor, privateName, info;
            for (key in attribs) {
                // Build up the descriptor for defineProperty call
                descriptor = {
                    configurable: false,
                    enumerable: true
                };
                info = attribs[key];
                privateName = "_".concat(key);
                // Create the private variable to store the actual value
                Object.defineProperty(this._attributes, privateName,
                    {
                        configurable: false,
                        enumerable: false,
                        writable: true,
                        value: info.value
                    });

                // The getter
                descriptor.get = makeAttributeGetter(privateName);
                // The setter
                if (!attribs[key].readonly) {
                    // Not readonly, so create a setter
                    descriptor.set = makeAttributeSetter(privateName);
                }
                Object.defineProperty(this._attributes, key, descriptor);
            }
        };

        // Static constant properties
        my.WorldObject.EVENTS = {
            CHILD_ADDED: 0,
            CHILD_REMOVING: 1,
            POSITION_CHANGED: 2,
            ROTATION_CHANGED: 3,
            ATTRIBUTE_CHANGED: 4
        };
        my.WorldObject.ORPHAN_ID = "orphan";
        my.WorldObject.TYPE = "world_object";

        // Static private methods
        my.WorldObject.prototype._insertChild = function (item) {
            var idx = this._children.push(item) - 1;
            item._insertedInto(this, idx);
            this._fireEvent(my.WorldObject.EVENTS.CHILD_ADDED,
                {childIndex: idx});
            return idx;
        };

        my.WorldObject.prototype._removeChild = function (item) {
            var idx = this._children.indexOf(item);
            if (idx !== -1) {
                this._fireEvent(my.WorldObject.EVENTS.CHILD_REMOVING,
                    {childIndex: idx});
                item._orphaned();
                this._children.splice(idx, 1);
            }
            return idx;
        };

        my.WorldObject.prototype._fireEvent = function (type, msg) {
            if (this.world()) {
                this.world()._doFireEvent(this, type, msg);
            }
        };

        // Public methods
        Object.defineProperties(my.WorldObject.prototype, {
            'position': {
                get: function () {
                    return this._position;
                },
                set: function (pos) {
                    var oldPos = this._position;
                    this._position = pos;
                    this._fireEvent(my.WorldObject.EVENTS.POSITION_CHANGED,
                        {old: oldPos});
                }
            },
            'rotation': {
                get: function () {
                    return this._rotation;
                },
                set: function (rot) {
                    var oldRot = this._rotation;
                    this._rotation = rot;
                    this._fireEvent(my.WorldObject.EVENTS.ROTATION_CHANGED,
                        {old: oldRot});
                }
            }
        });

        my.WorldObject.prototype.children = function () {
            return this._children;
        };

        my.WorldObject.prototype.type = function () {
            return this._type;
        };

        my.WorldObject.prototype.attributes = function () {
            return this._attributes;
        };

        my.WorldObject.prototype.world = function () {
            return this._world;
        };

        my.WorldObject.prototype.addChild = function (item) {
            return this._insertChild(item);
        };

        my.WorldObject.prototype.removeChild = function (item) {
            return this._removeChild(item);
        };

        my.WorldObject.prototype.getChild = function (index) {
            return this._children[index];
        };

        my.WorldObject.prototype.worldId = function () {
            return this._worldId;
        };

        my.WorldObject.prototype._insertedInto = function (parent, index) {
            this._parent = parent;
            this._worldId = parent.worldId().concat(".", index);
            if (parent.world()) {
                this._worldInserted(parent.world());
            }
        };

        my.WorldObject.prototype._orphaned = function () {
            this._parent = null;
            this._worldId = my.WorldObject.ORPHAN_ID;
            if (this.world()) {
                this._worldRemoved();
            }
        };

        my.WorldObject.prototype._worldInserted = function (world) {
            if (this.world()) {
                throw new Error("Cannot insert into world, already in world.");
            }
            this._world = world;
            this._children.forEach(function (child) {
                child._worldInserted(world);
            });
        };

        my.WorldObject.prototype._worldRemoved = function () {
            if (!this.world()) {
                throw new Error("Cannot remove from world, not in world.");
            }
            this._world = null;
            var child;
            for (child in this._children) {
                child._worldRemoved();
            }
        };

        my.World = function () {
            my.WorldObject.call(this, my.World.TYPE);
            this._parent = null;
            this._world = this; // The world is always 'in' itself
            this._worldId = my.World.TYPE;

            // Keep track of event listeners for each type of world object
            var _eventManager = new event.EventManager();


            /**
             * Register to listen for events emitted from world objects
             *
             * @param objectType the type of object to listen for events from.
             * @param eventType The type of event to listen for.
             * @param l The callback function.
             */
            this.addListener = function (objectType, eventType, l) {
                _eventManager.addListener(objectType, eventType, l);
            };

            /**
             * Deregister from listening for particular events from this object.
             *
             * @param objectType The type of object.
             * @param eventType The type of event to deregister for.
             * @param l The callback function.
             */
            this.removeListener = function (objectType, eventType, l) {
                _eventManager.removeListener(objectType, eventType, l);
            };

            /**
             * Fire an event from a world object to any attached listeners.
             *
             * @param object the object that is firing the event
             * @param eventType the type of message being fired
             * @param msg the message contents
             * @private
             */
            this._doFireEvent = function (object, eventType, msg) {
                _eventManager.fireEvent(object, eventType, msg);
            };
        };
        util.extend(my.WorldObject, my.World);
        // Static constant properties
        my.World.TYPE = 'world';


        my.Atom = function (position, specie, radius) {
            var attributes = {
                specie: {value: typeof specie !== 'undefined' ? specie : "H"},
                radius: {value: typeof radius !== 'undefined' ? radius : 1.0},
                color: {value: {r: 0.53, g: 0.34, b: 0.65}}
            };
            my.WorldObject.call(this, my.Atom.TYPE, attributes);
            delete my.Atom.prototype.rotation;

            this.position = position;
        };
        util.extend(my.WorldObject, my.Atom);
        // Static constant properties
        my.Atom.TYPE = 'atom';

        my.UnitCell = function () {
            var attributes = {
                a: {value: glm.vec3.fromValues(10, 0, 0)},
                b: {value: glm.vec3.fromValues(0, 10, 0)},
                c: {value: glm.vec3.fromValues(0, 0, 10)}
            };
            my.WorldObject.call(this, my.UnitCell.TYPE, attributes);
            delete my.Atom.prototype.rotation;
        };
        util.extend(my.WorldObject, my.UnitCell);
        // Static constant properties
        my.UnitCell.TYPE = 'unit_cell';

        my.Crystal = function (unitCell) {
            var attributes = {};
            my.WorldObject.call(this, my.Crystal.TYPE, attributes);

            var _unitCell = typeof unitCell !== 'undefined' ? unitCell : new my.UnitCell();

            this.addChild(_unitCell);
        };
        util.extend(my.WorldObject, my.Crystal);
        //Static constant properties
        my.Crystal.TYPE = 'crystal';


        return my;
    });


