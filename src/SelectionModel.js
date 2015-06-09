/**
 * Created by uhrin on 05/06/15.
 */
define(function () {
    'use strict';

    var SelectionModel = function () {
        var _selected = [];
        var _listeners = [];

        function notifySelectionChanged(oldSelection, initiator) {
            var i = 0;
            for (i = 0; i < _listeners.length; ++i) {
                _listeners[i](oldSelection, initiator);
            }
        }

        this.getSelected = function () {
            return _selected;
        };

        /**
         * Set the currently selected items.
         * @param selected An array of selected objects
         * @param initiator (optional) An identifier for who set the selection, can be used,
         * for example, for a listener to ignore selection events it generated itself.
         */
        this.setSelected = function (selected, initiator) {
            var old = this.getSelected();
            _selected = selected;
            notifySelectionChanged(old, initiator);
        };

        this.addListener = function (callback) {
            _listeners.push(callback);
        };
        this.removeListener = function (callback) {
            var idx = _listeners.indexOf(callback);
            if (idx > -1) {
                _listeners.splice(idx, 1);
            }
        };
    };

    return SelectionModel;
});