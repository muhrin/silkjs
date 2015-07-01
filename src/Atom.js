/**
 * Created by uhrin on 05/06/15.
 */
define(["./WorldObject", "./util"],
    function (WorldObject, util) {
        'use strict';

        var Atom = function (position, specie, radius) {
            var attributes = {
                specie: {value: typeof specie !== 'undefined' ? specie : "H"},
                radius: {
                    value: typeof radius !== 'undefined' ? radius : 1.0,
                    type: WorldObject.ATTRIBUTE_TYPE.FLOAT
                },
                color: {
                    value: "#2B8CBE",
                    type: WorldObject.ATTRIBUTE_TYPE.COLOR
                }
            };
            WorldObject.call(this, Atom.TYPE, attributes);
            delete Atom.prototype.rotation;

            this.position = position;
        };
        util.extend(WorldObject, Atom);
        // Static constant properties
        Atom.TYPE = 'atom';

        return Atom;
    });