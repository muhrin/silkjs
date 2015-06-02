/**
 * Created by Martin Uhrin on 17/05/15.
 */
define(["silk/util"],
    function (util) {
        'use strict';

        var my = {};

        my.ANY_OBJECT = "_ANY_OBJECT";
        my.ANY_EVENT = "_ANY_EVENT";

        my.EventManager = function () {
            var _listeners = {};

            this.addListener = function (objectType, eventType, callback) {
                if (!_listeners.hasOwnProperty(objectType)) {
                    _listeners[objectType] = {};
                }
                if (!_listeners[objectType].hasOwnProperty(eventType)) {
                    _listeners[objectType][eventType] = [];
                }
                _listeners[objectType][eventType].push(callback);
            };

            this.removeListener = function (objectType, eventType, callback) {
                var idx = _listeners[objectType][eventType].indexOf(callback);
                if (idx !== -1) {
                    _listeners[objectType][eventType].splice(idx, 1);
                    if (_listeners[objectType][eventType].length === 0) {
                        delete _listeners[objectType][eventType];
                    }
                }
            };

            this.getListeners = function (objectType, eventType) {
                if (_listeners.hasOwnProperty(objectType) &&
                    _listeners[objectType].hasOwnProperty(eventType)) {
                    return _listeners[objectType][eventType];
                }
                return [];
            };
        };

        my.EventManager.prototype.fireEvent = function (object, eventType, msg) {
            var i, listeners = this.getListeners(object.type(), eventType);
            // Now get those for any object and any event

            util.extendArray(listeners, this.getListeners(my.ANY_OBJECT, eventType));
            util.extendArray(listeners, this.getListeners(object.type(), my.ANY_EVENT));
            util.extendArray(listeners, this.getListeners(my.ANY_OBJECT, my.ANY_EVENT));

            // TODO: Make sure listeners only contains unique entries (i.e. is set-like)

            for (i = 0; i < listeners.length; ++i) {
                listeners[i](object, msg);
            }

        };

        return my;
    });