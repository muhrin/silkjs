/**
 * Created by uhrin on 05/06/15.
 */
define(["silk/visualisation", "silk/util", "silk/event", "webix"],
    function (vis, util, event) {
        my = {};


        my.PropertySheetController = function (world, selectionModel, sheetId) {
            var sheet = $$(sheetId);

            function buildAttributePaths(attribute, pathString, paths) {
                if (typeof pathString === 'undefined') {
                    pathString = "";
                }
                if (typeof paths === 'undefined') {
                    paths = {};
                }

                if (util.isObject(attribute)) {
                    var key, subpath = pathString;
                    if (subpath !== "") {
                        subpath += ".";
                    }
                    for (key in attribute) {
                        buildAttributePaths(attribute[key], subpath.concat(key), paths);
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


            function generateAttributeElements() {
                // Get the attributes common to all
                var attribs = getCommonAttributes();
                var key, elements = [];
                for (key in attribs) {
                    elements.push({ id: key, label: key, value: attribs[key], type: "text" });
                }
                return elements;
            }

            selectionModel.addListener(function () {
                sheet.define({
                    elements: generateAttributeElements()
                });
                sheet.refresh();
            });

            sheet.attachEvent("onAfterEditStop", function (state, editor) {
                setAttributeValue(editor.id, state.value);
            });

        };


        return my;
    });