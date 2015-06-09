/**
 * Created by uhrin on 04/06/15.
 */
define(["silk/WorldObject", "silk/util", "silk/event", "webix"],
    function (WorldObject, util, event) {
        var my = {};

        my.Controller = function (world, tableId, idPrefix) {
            var ATTRIB_DELIM = "[attr]";

            var treetable = $$(tableId);

            function createAttributesNodes(attributes, parentId, idPrefix) {
                var key, value, node, id, nodes = [];
                for (key in attributes) {
                    id = idPrefix.concat(key);
                    value = attributes[key];

                    if (util.isObject(value)) {
                        treetable.add({
                                id: id,
                                property: key
                            }, -1, parentId);

                        createAttributesNodes(value, id, id.concat("."));
                    } else {
                        treetable.add({
                            id: id,
                            property: key,
                            value: value,
                            editor: "text"
                        }, -1, parentId);
                    }
                }
                return nodes;
            }

            function worldInserted(object) {
                var parent = object.parent();
                var id = object.worldId();
                treetable.add({
                        id: id,
                        property: object.type()
                    },
                    parent.childIndex(object),
                    parent.worldId() === world.worldId() ? null : parent.worldId()
                );
                createAttributesNodes(object.attributes(), id, id.concat(ATTRIB_DELIM));
            }

            function worldRemoving(object) {

            }


            function getDescendantProp(desc, obj) {
                obj = obj || window;
                var arr = desc.split(".");
                while (arr.length && (obj = obj[arr.shift()]));
                return obj;
            }

            function set(obj, str, val) {
                str = str.split(".");
                while (str.length > 1)
                    obj = obj[str.shift()];
                return obj[str.shift()] = val;
            }

            world.addListener(event.ANY_OBJECT,
                WorldObject.EVENTS.WORLD_INSERTED, worldInserted);
            world.addListener(event.ANY_OBJECT,
                WorldObject.EVENTS.WORLD_REMOVING, worldRemoving);

            treetable.attachEvent("onAfterEditStop", function (state, editor, ignoreUpdate) {
                if (state.value !== state.old) {
                    var idAndAttribute = editor.row.split(ATTRIB_DELIM);

                    var obj = world.getChildFromPath(idAndAttribute[0].substring(world.worldId().length + 1).split("."));
                    set(obj.attributes(), idAndAttribute[1], state.value);
                }
            });
        };


        return my;
    }
);