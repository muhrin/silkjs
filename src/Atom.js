/**
 * Created by uhrin on 05/06/15.
 */
define(["silk/WorldObject", "silk/util"],
    function (WorldObject, util) {
        'use strict';

        var Atom = function (position, specie, radius) {
            var attributes = {
                specie: {value: typeof specie !== 'undefined' ? specie : "H"},
                radius: {value: typeof radius !== 'undefined' ? radius : 1.0},
                color: {value: {r: 0.53, g: 0.34, b: 0.65}}
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