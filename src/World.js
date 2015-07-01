/**
 * Created by Martin Uhrin on 05/06/15.
 */
define(["./WorldObject", "./util", "./event", "require"],
    function (WorldObject, util, event) {
        'use strict';

        var World = function () {
            WorldObject.call(this, World.TYPE);
            this._parent = null;
            this._world = this; // The world is always 'in' itself
            this._worldId = World.TYPE;

            var extraAttributes = {};

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

            this.getObject = function (worldId) {
                return this.getChildFromPath(worldId.split("."), 1);
            };

            this.attachExtraAttribute = function (objectType, name, info) {
                this.attachExtraAttributes(objectType, {name: info});
            };

            this.attachExtraAttributes = function (objectType, attrs) {
                // TODO: Add attributes to any existing world objects
                util.merge(attrs, util.ensureExists(extraAttributes, objectType, {}));
            };


            function worldInserted (obj) {
                var attrs = extraAttributes[obj.type()];
                if (attrs) {
                    var key;
                    for (key in attrs) {
                        obj.addAttribute(key, attrs[key]);
                    }
                }
            }

            function worldRemoving (obj) {
                if (extraAttributes.hasOwnProperty(obj.type())) {
                    var key;
                    var names = [];
                    for (key in extraAttributes) {
                        names.push(key);
                    }
                    obj.removeAttributes(names);
                }
            }

            // Listen for any new objects being inserted into the world
            this.addListener(event.ANY_OBJECT,
                WorldObject.EVENTS.WORLD_INSERTED, worldInserted);
            this.addListener(event.ANY_OBJECT,
                WorldObject.EVENTS.WORLD_REMOVING, worldRemoving);
        };
        util.extend(WorldObject, World);

        // Static constant properties
        World.TYPE = 'world';

        return World;

    });