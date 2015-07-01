/**
 * Created by martin on 08/06/15.
 */
define([
        "./AtomController",
        "./CrystalController",
        "./UnitCellController",
        "./WorldController",
        "silk/event",
        "silk/util",
        "silk/WorldObject",
        "lib/scenejs",
        "require"
    ],
    function (AtomController,
              CrystalController,
              UnitCellController,
              WorldController,
              event,
              util,
              WorldObject) {
        'use strict';

        var SceneManager = function (world, canvasId) {
            var _mappers = {};
            var _world = world;
            var that = this;

            // Private methods
            function prune(node) {
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
                this.scene().getNode("library",
                    function (library) {
                        library.addNode(node);
                    });
            }

            function createSceneNodes(canvasId) {
                var libraryNodes = [];
                var t;
                for (t in _mappers) {
                    util.extendArray(libraryNodes, _mappers[t].getLibraryNodes());
                }
                var scene = {
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
                            eye: {x: 0, y: 0, z: 10},
                            look: {x: 0, y: 0, z: 0},

                            nodes: [that.createNode(_world)]
                        }
                    ]
                };
                if (canvasId) {
                    scene.canvasId = canvasId;
                }
                return scene;
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
                        id: worldObject.worldId().concat("_rotate"),
                        type: "rotate"
                    });
                }

                // Translation node.  Always has to be present and
                // come last in the chain
                var pos = typeof worldObject.position !== 'undefined' ?
                    worldObject.position : [0.0, 0.0, 0.0];
                chain.push({
                    id: worldObject.worldId().concat("_translate"),
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

                // Add any library node to the scene as required
                var libraryNodes = mapper.getLibraryNodes();
                if (this.scene() && libraryNodes.length !== 0) {
                    this.addToLibrary(libraryNodes);
                }

                // Register any extra attributes for this object type
                var attrs = _mappers[objType].getModelAttributes();
                if (attrs) {
                    world.attachExtraAttributes(objType, attrs);
                }
            };
            this.removeMapper = function (worldObjectType) {
                if (_mappers.hasOwnProperty(worldObjectType)) {

                    // Deregister any extra attributes for this object type
                    var attrs = _mappers[worldObjectType].getModelAttributes();
                    if (attrs) {
                        world.attachExtraAttributes(worldObjectType, attrs);
                    }

                    _mappers[worldObjectType].detach();
                    delete _mappers[worldObjectType];
                }
            };
            this.removeFromLibrary = function (nodeId) {
                this._scene.getNode(nodeId, function (node) {
                    node.destroy();
                });
            };
            this.scene = function () {
                return _scene;
            };
            this.world = function () {
                return _world;
            };

            this.addMapper(new AtomController());
            this.addMapper(new CrystalController());
            this.addMapper(new UnitCellController());
            this.addMapper(new WorldController());


            _world.addListener(event.ANY_OBJECT,
                WorldObject.EVENTS.CHILD_ADDED, childAdded);
            _world.addListener(event.ANY_OBJECT,
                WorldObject.EVENTS.CHILD_REMOVING, childRemoving);
            _world.addListener(event.ANY_OBJECT,
                WorldObject.EVENTS.POSITION_CHANGED, positionChanged);
            _world.addListener(event.ANY_OBJECT,
                WorldObject.EVENTS.ROTATION_CHANGED, rotationChanged);

            var _scene = SceneJS.createScene(createSceneNodes(canvasId));
        };

        return SceneManager;
    });