/**
 * Created by uhrin on 05/06/15.
 */
define(["./WorldObject", "./UnitCell", "./util"],
    function (WorldObject, UnitCell, util) {
        'use strict';

        var Crystal = function (unitCell) {
            var attributes = {};
            WorldObject.call(this, Crystal.TYPE, attributes);

            unitCell = typeof unitCell !== 'undefined' ? unitCell : new UnitCell();

            this.addChild(unitCell);
        };
        util.extend(WorldObject, Crystal);
        //Static constant properties
        Crystal.TYPE = 'crystal';

        return Crystal;
    });