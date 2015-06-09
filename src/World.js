/**
 * Created by uhrin on 05/06/15.
 */
define(["./WorldObject", "./util", "./event", "require"],
    function (WorldObject, util, event) {
        'use strict';

        var World = function () {
            WorldObject.call(this, World.TYPE);
            this._parent = null;
            this._world = this; // The world is always 'in' itself
            this._worldId = World.TYPE;

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

            this.getObject = function (id) {
                return this.getChildFromPath(id.split("."), 1);
            };
        };
        util.extend(WorldObject, World);

        // Static constant properties
        World.TYPE = 'world';

        return World;

    });