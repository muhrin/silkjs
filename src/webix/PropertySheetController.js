/**
 * Created by Martin Uhrin on 05/06/15.
 */
define(["silk/util", "silk/WorldObject", "lib/webix"],
    function (util, WorldObject) {
        'use strict';

        var getCommonValue = function (worldObjects, attributeName) {
            // Check if they all have the same value
            var obj, value, i;
            for (i = 0; i < worldObjects.length; ++i) {
                obj = worldObjects[i];

                if (value === undefined) {
                    value = util.getProperty(obj.attributes(), attributeName);
                } else {
                    if (value !== util.getProperty(obj.attributes(), attributeName)) {
                        value = undefined;
                        break;
                    }
                }
            }
            return value;
        };

        /**
         * An mapper that knows how to create, update and parse a webix
         * editor converting to the type that the world object expects
         * for its attribute.
         * This is a base class for all such mappers.
         *
         * @param {WorldObject.ATTRIBUTE_TYPE} attributeType The attribute
         * type this mapper maps from and to.
         * @constructor
         */
        var EditorMapper = function (attributeType) {
            if (this.constructor === EditorMapper) {
                throw new Error("Cannot instantiate abstract class EditorMapper");
            }
            this._attributeType = attributeType;
        };

        /**
         * The attribute type that this mapper provides support for.
         *
         * @returns {WorldObject.ATTRIBUTE_TYPE} The attribute type
         */
        EditorMapper.prototype.attributeType = function () {
            return this._attributeType;
        };

        /**
         * Create a webix element that defines the editor for the attribute
         * supplied.
         *
         * @param {Array.<WorldObject>} worldObjects The world object(s) to
         * create an editor for.
         * @param {string} attributeName The name of the attribute that the
         * editor is for.
         * @return {Object} A dictionary defining the editor conforming to
         * webix specs.
         * @abstract
         */
        EditorMapper.prototype.createDescriptor = function (worldObjects,
                                                            attributeName) {
            throw new Error("Abstract method");
        };

        /**
         * Get the value from the editor and its state as the type that is
         * expected by the world object attribute.
         *
         * @param state
         * @param editor
         * @return {*} The attribute value as represented by the editor
         * @abstract
         */
        EditorMapper.prototype.updateObjects = function (state,
                                                         editor,
                                                         attributeName,
                                                         worldObjects) {
            throw new Error("Abstract method");
        };

        /**
         * Update the editor based on the current attribute value(s) of the
         * world object(s).
         *
         * @param {Array.<WorldObject>} worldObjects The world object(s) to
         * update the editor from.
         * @param {string} attributeName The attribute of the world object(s)
         * to use.
         * @param editor The webix editor to update
         */
        EditorMapper.prototype.updateItem = function (worldObjects,
                                                      attributeName,
                                                      item) {
            throw new Error("Abstract method");
        };

        var SimpleEditorMapper = function (attributeType, mappedType, editorType) {
            EditorMapper.call(this, attributeType); // Call base
            var _mappedType = mappedType;
            var _editorType = editorType;

            this.createDescriptor = function (worldObjects, attributeName) {
                var desc = {type: _editorType};

                var value = getCommonValue(worldObjects, attributeName);
                if (value !== undefined) {
                    desc.value = value;
                }

                return desc;
            };

            this.updateObjects = function (state, editor, attributeName,
                                           worldObjects) {
                var newValue = _mappedType(state.value);

                // Set the value on all objects
                if (newValue !== undefined) {
                    worldObjects.forEach(function (obj) {
                        util.setProperty(obj.attributes(), attributeName, newValue);
                    });
                    return true;
                }
                return false;
            };

            this.updateItem = function (worldObjects, attributeName, item) {
                // Check if they all have the same value
                var value = getCommonValue(worldObjects, attributeName);
                if (item.value !== value) {
                    item.value = value;
                    return true;
                }
                return false;
            };
        };
        util.extend(EditorMapper, SimpleEditorMapper);

        var PropertySheetController = function (world, selectionModel, sheetId) {
            var sheet = $$(sheetId);
            var _editorMappers = {};

            // Private functions
            function buildAttributePaths(attributes, attribute, pathString, paths) {
                if (typeof attribute === 'undefined') {
                    attribute = attributes;
                    pathString = "";
                    paths = {};
                }

                //if (util.isObject(attribute)) {
                if (!attributes.getInfo(pathString)) {
                    var key, subpath = pathString;
                    if (subpath !== "") {
                        subpath += ".";
                    }
                    for (key in attribute) {
                        buildAttributePaths(attributes, attribute[key],
                            subpath.concat(key), paths);
                    }
                } else {
                    paths[pathString] = attribute;
                }

                return paths;
            }

            function getCommonAttributes() {
                var selected = selectionModel.getSelected();
                if (selected.length === 0) {
                    return {};
                }
                // Get the first one as the reference and check against all the others
                var attribs = buildAttributePaths(selected[0].attributes());
                if (selected.length > 1) {
                    var toRemove = [];
                    var key, i;
                    for (key in attribs) {
                        for (i = 1; i < selected.length; ++i) {
                            try {
                                if (util.getProperty(selected[i].attributes(), key) !== attribs[key]) {
                                    attribs[key] = null;
                                }
                            } catch (err) {
                                // This WorldObject doesn't have that attribute
                                toRemove.push(key);
                                break;
                            }
                        }
                    }

                    for (i = 0; i < toRemove.length; ++i) {
                        delete attribs[toRemove[i]];
                    }
                }
                return attribs;
            }

            function setAttributeValue(attribId, value) {
                selectionModel.getSelected().forEach(function (obj) {
                    util.setProperty(obj.attributes(), attribId, value);
                });
            }

            function createElement(worldObjects, attributeName) {
                var type = worldObjects[0].attributes().getInfo(attributeName).type;
                if (_editorMappers.hasOwnProperty(type)) {
                    return _editorMappers[type].createDescriptor(worldObjects, attributeName);
                }
                return {type: "text"};
            }

            function generateAttributeElements() {
                // Get the attributes common to all
                var attribs = getCommonAttributes();
                var selected = selectionModel.getSelected()[0];
                var elem;
                var key, elements = [];
                for (key in attribs) {
                    elem = { id: key, label: key };
                    util.merge(createElement(selectionModel.getSelected(), key), elem);
                    elements.push(elem);
                }
                return elements;
            }

            // Public functions
            this.addEditorMapper = function (mapper) {
                _editorMappers[mapper.attributeType()] = mapper;
            };

            this.removeEditorMapper = function (attributeType) {
                delete _editorMappers[attributeType];
            };

            selectionModel.addListener(function () {
                sheet.define({
                    elements: generateAttributeElements()
                });
                sheet.refresh();
            });

            sheet.attachEvent("onAfterEditStop", function (state, editor) {
                var attribId = editor.id;
                var type = selectionModel.getSelected()[0].attributes().getInfo(attribId).type;

                if (_editorMappers.hasOwnProperty(type)) {
                    _editorMappers[type].updateObjects(state, editor, attribId, selectionModel.getSelected());
                }
            });

            this.addEditorMapper(new SimpleEditorMapper(WorldObject.ATTRIBUTE_TYPE.STRING, String, "text"));
            this.addEditorMapper(new SimpleEditorMapper(WorldObject.ATTRIBUTE_TYPE.COLOR, String, "color"));
            this.addEditorMapper(new SimpleEditorMapper(WorldObject.ATTRIBUTE_TYPE.FLOAT, Number, "text"));
            this.addEditorMapper(new SimpleEditorMapper(WorldObject.ATTRIBUTE_TYPE.INTEGER, Number, "text"));

        };

        return PropertySheetController;
    });