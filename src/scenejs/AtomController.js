/**
 * Created by martin on 08/06/15.
 */
define(["./NodeController", "silk/Atom", "silk/util", "silk/WorldObject"],
    function (NodeController, Atom, util, WorldObject) {
        'use strict';

        var AtomController = function () {
            NodeController.call(this, Atom.TYPE);
            var that = this;

            function attributeChanged(object, msg) {
                if (msg.name === "radius") {
                    var r = object.attributes().radius;
                    that.scene().getNode(object.worldId().concat("_scale"),
                        function (node) {
                            node.setXYZ({x: r, y: r, z: r});
                        });
                }
                else if (msg.name === "color") {
                    that.scene().getNode(object.worldId().concat("_material"),
                        function (node) {
                            node.setBaseColor(object.attributes().color);
                        });
                }
                else if (msg.name === "scenejs.shine") {
                    that.scene().getNode(object.worldId().concat("_material"),
                        function (node) {
                            node.setShine(object.attributes().scenejs.shine);
                        });
                }
                else if (msg.name === "scenejs.alpha") {
                    that.scene().getNode(object.worldId().concat("_material"),
                        function (node) {
                            node.setAlpha(object.attributes().scenejs.alpha);
                        });
                }
            }

            this.getModelAttributes = function () {
                return {
                    "scenejs.alpha": {value: 1.0},
                    "scenejs.shine": {value: 70.0}
                };
            };

            this.worldAttached = function () {
                this.world().addListener(Atom.TYPE,
                    WorldObject.EVENTS.ATTRIBUTE_CHANGED, attributeChanged);
            };

            this.worldDetaching = function () {
                this.world().removeListener(Atom.TYPE,
                    WorldObject.EVENTS.ATTRIBUTE_CHANGED, attributeChanged);
            };
        };
        util.extend(NodeController, AtomController);

        AtomController.prototype.getLibraryNodes = function () {
            return [{
                id: "atom_unit_sphere",
                coreId: "atom_unit_sphere",
                type: "geometry/sphere",
                radius: 1
            }];
        };

        AtomController.prototype.createNode = function (atom) {
            var r = atom.attributes().radius;
            return {
                id: atom.worldId().concat("_scale"),
                type: "scale",
                x: r,
                y: r,
                z: r,
                nodes: [{
                    id: atom.worldId().concat("_material"),
                    type: "material",
                    color: atom.attributes().color,
                    nodes: [{
                        type: "geometry/sphere",
                        coreId: "atom_unit_sphere"
                    }]
                }]
            };
        };

        return AtomController;
    });