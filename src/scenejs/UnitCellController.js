/**
 * Created by martin on 08/06/15.
 */
define([
        "./NodeController",
        "silk/UnitCell",
        "silk/util",
        "silk/WorldObject",
        "lib/gl-matrix"
    ],
    function (NodeController,
              UnitCell,
              util,
              WorldObject,
              glm) {
        'use strict';

        var UnitCellController = function () {
            NodeController.call(this, UnitCell.TYPE);
            var that = this;

            function attributeChanged(object, msg) {
                if (msg.name === "a" || msg.name === "b" || msg.name === "c") {
                    that.scene().getNode(object.worldId().concat("_lines"),
                        function (node) {
                            node.setPositions({positions: that._generateLineList(object)});
                        });
                }
            }

            this._generateLineList = function (unitCell) {
                var lineList = [];
                var i, j, dA, dB, dC, start = glm.vec3.create(), end = glm.vec3.create();
                for (i = 0; i < 2; ++i) {
                    for (j = 0; j < 2; ++j) {
                        // A vector
                        glm.vec3.scale(start, unitCell.attributes().b, i);
                        glm.vec3.scaleAndAdd(start, start, unitCell.attributes().c, j);
                        glm.vec3.add(end, start, unitCell.attributes().a);
                        lineList.push(start[0], start[1], start[2], end[0], end[1], end[2]);

                        // B vector
                        glm.vec3.scale(start, unitCell.attributes().a, i);
                        glm.vec3.scaleAndAdd(start, start, unitCell.attributes().c, j);
                        glm.vec3.add(end, start, unitCell.attributes().b);
                        lineList.push(start[0], start[1], start[2], end[0], end[1], end[2]);

                        // C vector
                        glm.vec3.scale(start, unitCell.attributes().a, i);
                        glm.vec3.scaleAndAdd(start, start, unitCell.attributes().b, j);
                        glm.vec3.add(end, start, unitCell.attributes().c);
                        lineList.push(start[0], start[1], start[2], end[0], end[1], end[2]);
                    }
                }
                return lineList;
            };

            this.attach = function (sceneManager) {
                this._attach(sceneManager);
                this.world().addListener(UnitCell.TYPE,
                    WorldObject.EVENTS.ATTRIBUTE_CHANGED, attributeChanged);
            };

            this.detach = function () {
                this.world().removeListener(UnitCell.TYPE,
                    WorldObject.EVENTS.ATTRIBUTE_CHANGED, attributeChanged);
                this._detach();
            };
        };
        util.extend(NodeController, UnitCellController);


        UnitCellController.prototype.createNode = function (unitCell) {
            // There are always 24 vertices to make up the lines of the cube
            // (12 edges * 2 vertices per line)
            var i, indices = [];
            for (i = 0; i < 24; ++i) {
                indices[i] = i;
            }

            return {
                type: "renderer",
                lineWidth: 2.0,

                nodes: [
                    {
                        id: unitCell.worldId().concat("_material"),
                        type: "material",
                        baseColor: {r: 0.0, g: 1.0, b: 0.2},
                        emit: 1.0,

                        nodes: [
                            {
                                id: unitCell.worldId().concat("_lines"),
                                type: "geometry",
                                primitive: "lines",

                                positions: this._generateLineList(unitCell),
                                indices: indices
                            }
                        ]
                    }
                ]
            };
        };

        return UnitCellController;
    });