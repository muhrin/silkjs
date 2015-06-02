/**
 * Created by uhrin on 20/05/15.
 */
define(["silk/visualisation", "silk/util", "silk/event", "gl-matrix", "scenejs"],
    function (vis, util, event, glm) {
        'use strict';

        var my = {};

        my.SceneManager = function (world) {
            var _mappers = {};
            var _world = world;
            var that = this;

            // Private methods
            function prune (node) {
                // TODO: Implement
            }

            function childAdded(object, msg) {
                // Get the node that this world object attaches to
                _scene.getNode(object.worldId().concat("_translate"),
                    function (node) {
                        node.addNode(
                            that.createNode(object.getChild(msg.childIndex))
                        );
                    });
            }
            function childRemoving(object, msg) {
                _scene.getNode(object.getChild(msg.childIndex).worldId(),
                    function (child) {
                        var parent = child.getParent();
                        child.destroy();
                        prune(parent);
                    });
            }

            function positionChanged(object, msg) {
                _scene.getNode(object.worldId().concat("_translate"),
                    function (node) {
                        var newPos = object.position;
                        node.setXYZ({x: newPos[0], y: newPos[1], z: newPos[2]});
                    });
            }

            function rotationChanged(object, msg) {
                _scene.getNode(object.worldId().concat("_rotate"),
                    function (node) {
                        var newRot = object.rotation;
                        // TODO: Set the rotation on the node
                    });
            }

            function addToLibrary(node) {
                this._scene.getNode("library",
                    function (library) {
                        library.addNode(node);
                    });
            }

            function createSceneNodes() {
                var libraryNodes = [];
                var t;
                for (t in _mappers) {
                    util.extendArray(libraryNodes, _mappers[t].getLibraryNodes());
                }
                return {
                    nodes: [
                        // The library of shared cores
                        {
                            id: "library",
                            type: "library",
                            nodes: libraryNodes
                        },
                        {
                            id: "camera",
                            type: "cameras/orbit",
                            yaw: 40,
                            pitch: -20,
                            zoom: 10,
                            zoomSensitivity: 1.0,
                            eye: { x: 0, y: 0, z: 10 },
                            look: { x: 0, y: 0, z: 0 },

                            nodes: [that.createNode(_world)]
                        }
                    ]
                };
            }

            this.createNode = function (worldObject) {
                if (!_mappers.hasOwnProperty(worldObject.type())) {
                    return null;
                }
                var i;

                // Create transformation nodes
                var attributes = worldObject.attributes();
                var chain = [];

                if (attributes.hasOwnProperty('rotation')) {
                    var rot = attributes.rotation;
                    chain.push({
                        id:  worldObject.worldId().concat("_rotate"),
                        type: "rotate"
                    });
                }

                // Translation node.  Always has to be present and
                // come last in the chain
                var pos = typeof worldObject.position !== 'undefined' ?
                    worldObject.position : [0.0, 0.0, 0.0];
                chain.push({
                    id:  worldObject.worldId().concat("_translate"),
                    type: "translate",
                    x: pos[0],
                    y: pos[1],
                    z: pos[2]
                });

                // Create the leaf node for this object
                var node = _mappers[worldObject.type()].createNode(worldObject);
                var children = [];
                if (worldObject.children().length !== 0) {
                    children = worldObject.children().map(this.createNode);
                }
                if (node) {
                    children.push(node);
                }

                if (children.length > 0) {
                    chain[chain.length - 1].nodes = children;
                }

                for (i = chain.length - 1; i > 0; --i) {
                    chain[i - 1].nodes = [chain[i]];
                }

                return chain[0];
            };

            // Public methods
            this.addMapper = function (mapper) {
                var objType = mapper.worldObjectType();
                if (_mappers.hasOwnProperty(objType)) {
                    this.removeMapper(objType);
                }
                _mappers[objType] = mapper;
                mapper.attach(this);
                var libraryNodes = mapper.getLibraryNodes();
                if (this.scene() && libraryNodes.length !== 0) {
                    this.addToLibrary(libraryNodes);
                }
            };
            this.removeMapper = function (worldObjectType) {
                if (_mappers.hasOwnProperty(worldObjectType)) {
                    _mappers[worldObjectType].detach();
                    delete _mappers[worldObjectType];
                }
            };
            this.removeFromLibrary = function (nodeId) {
                this._scene.getNode(nodeId, function (node) { node.destroy(); });
            };
            this.scene = function () {
                return _scene;
            };
            this.world = function () {
                return _world;
            };

            this.addMapper(new my.WorldMapper());
            this.addMapper(new my.AtomMapper());
            this.addMapper(new my.UnitCell());
            this.addMapper(new my.Crystal());

            _world.addListener(event.ANY_OBJECT,
                vis.WorldObject.EVENTS.CHILD_ADDED, childAdded);
            _world.addListener(event.ANY_OBJECT,
                vis.WorldObject.EVENTS.CHILD_REMOVING, childRemoving);
            _world.addListener(event.ANY_OBJECT,
                vis.WorldObject.EVENTS.POSITION_CHANGED, positionChanged);
            _world.addListener(event.ANY_OBJECT,
                vis.WorldObject.EVENTS.ROTATION_CHANGED, rotationChanged);
            var _scene = SceneJS.createScene(createSceneNodes());
        };



        function NodeManager(worldObjectType) {
            if (this.constructor === NodeManager) {
                throw new Error("Cannot instantiate abstract class NodeManager");
            }
            // Private properties
            var _sceneMan = null, _worldObjectType = worldObjectType;

            this._attach = function (sceneMan) {
                _sceneMan = sceneMan;
            };
            this._detach = function () {
                _sceneMan = null;
            };

            this.sceneManager = function () {
                return _sceneMan;
            };

            this.world = function () {
                return _sceneMan.world();
            };

            this.scene = function () {
                return _sceneMan.scene();
            };

            this.worldObjectType = function () {
                return _worldObjectType;
            };
        }

        NodeManager.prototype.createNode = function (worldObject) {
            throw new Error("Abstract method");
        };
        NodeManager.prototype.attach = function (sceneManager) {
            this._attach(sceneManager);
        };
        NodeManager.prototype.detach = function () {
            this._detach();
        };
        NodeManager.prototype.getLibraryNodes = function () {
            return [];
        };

        my.AtomMapper = function () {
            NodeManager.call(this, vis.Atom.TYPE);
            var that = this;

            function attributeChanged(object, msg) {
                if(msg.name === "radius") {
                    var r = object.attributes().radius;
                    that.scene().getNode(object.worldId().concat("_scale"),
                        function (node) {
                            node.setXYZ({x: r, y:r, z:r});
                    });
                }
                if(msg.name === "color") {
                    that.scene().getNode(object.worldId().concat("_material"),
                        function (node) {
                            node.setBaseColor(object.attributes().color);
                        });
                }
            }

            this.attach = function (sceneManager) {
                this._attach(sceneManager);
                this.world().addListener(vis.Atom.TYPE,
                    vis.WorldObject.EVENTS.ATTRIBUTE_CHANGED, attributeChanged);
            };

            this.detach = function () {
                this.world().removeListener(vis.Atom.TYPE,
                    vis.WorldObject.EVENTS.ATTRIBUTE_CHANGED, attributeChanged);
                this._detach();
            };
        };
        util.extend(NodeManager, my.AtomMapper);

        my.AtomMapper.prototype.getLibraryNodes = function () {
            return [{
                id: "atom_unit_sphere",
                coreId: "atom_unit_sphere",
                type: "geometry/sphere",
                radius: 1
            }];
        };

        my.AtomMapper.prototype.createNode = function (atom) {
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

        my.UnitCell = function () {
            NodeManager.call(this, vis.UnitCell.TYPE);
            var that = this;

            function attributeChanged(object, msg) {
                if(msg.name === "a" || msg.name === "b" || msg.name === "c") {
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
            }

            this.attach = function (sceneManager) {
                this._attach(sceneManager);
                this.world().addListener(vis.UnitCell.TYPE,
                    vis.WorldObject.EVENTS.ATTRIBUTE_CHANGED, attributeChanged);
            };

            this.detach = function () {
                this.world().removeListener(vis.UnitCell.TYPE,
                    vis.WorldObject.EVENTS.ATTRIBUTE_CHANGED, attributeChanged);
                this._detach();
            };
        };
        util.extend(NodeManager, my.UnitCell);


        my.UnitCell.prototype.createNode = function (unitCell) {
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
                        baseColor:      { r: 0.0, g: 1.0, b: 0.2 },
                        emit:           1.0,

                        nodes: [
                            {
                                id: unitCell.worldId().concat("_lines"),
                                type: "geometry",
                                primitive: "lines",

                                positions: this._generateLineList(unitCell),
                                indices : indices
                            }
                        ]
                    }
                ]
            };
        };

        my.Crystal = function () {
            NodeManager.call(this, vis.Crystal.TYPE);
        };
        util.extend(NodeManager, my.Crystal);

        my.WorldMapper = function () {
            NodeManager.call(this, vis.World.TYPE);
        };
        util.extend(NodeManager, my.WorldMapper);

        my.Crystal.prototype.createNode = function (crystal) {
            return null;
        };

        my.WorldMapper.prototype.createNode = function (world) {
            // Nothing to do: the world is as it is
            return null;
        };

        return my;
    });