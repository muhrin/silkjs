/**
 * Created by uhrin on 05/06/15.
 */
define(["silk/WorldObject", "silk/util", "lib/gl-matrix"],
    function (WorldObject, util, glm) {
        'use strict';

        var UnitCell = function () {
            var attributes = {
                a: {value: glm.vec3.fromValues(10, 0, 0)},
                b: {value: glm.vec3.fromValues(0, 10, 0)},
                c: {value: glm.vec3.fromValues(0, 0, 10)}
            };

            WorldObject.call(this, UnitCell.TYPE, attributes);
            delete WorldObject.prototype.rotation;
        };
        util.extend(WorldObject, UnitCell);
        // Static constant properties
        UnitCell.TYPE = 'unit_cell';

        return UnitCell;
    });