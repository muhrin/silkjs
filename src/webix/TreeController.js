/**
 * Created by uhrin on 05/06/15.
 */
define(["silk/WorldObject", "silk/util", "silk/event", "lib/webix"],
    function (WorldObject, util, event) {
        'use strict';

        var TreeController = function (world, selectionModel, treeId) {
            var tree = $$(treeId);

            function addAllChildren(parent) {
                var child, i, numChildren = parent.children().length;
                for (i = 0; i < numChildren; ++i) {
                    child = parent.getChild(i);
                    tree.add({id: child.worldId(), value: child.type()}, i,
                        parent.worldId() === world.worldId() ? null : parent.worldId()
                    );
                    addAllChildren(child);
                }
            }


            function childAdded(parent, msg) {
                var child = parent.getChild(msg.childIndex);
                tree.add({id: child.worldId(), value: child.type()},
                    msg.childIndex,
                    parent.worldId() === world.worldId() ? null : parent.worldId()
                );
                addAllChildren(child);
                tree.refresh();
            }

            function childRemoving(parent, msg) {
                tree.remove(parent.getChild(msg.childIndex).worldId());
            }

            // Build the initial tree (if anything exists in the world)
            addAllChildren(world);

            // Register to listen for events in the world
            world.addListener(event.ANY_OBJECT, WorldObject.EVENTS.CHILD_ADDED, childAdded);
            world.addListener(event.ANY_OBJECT, WorldObject.EVENTS.CHILD_REMOVING, childRemoving);

            selectionModel.addListener(function (oldSelection, initiator) {
                if (initiator !== "tree_controller") {
                    // TODO: Set the selection on the tree
                }
            });

            tree.attachEvent("onSelectChange", function () {
                var selectedIds = tree.getSelectedId(true);
                var i, selected = [];
                for (i = 0; i < selectedIds.length; ++i) {
                    selected.push(world.getObject(selectedIds[i]));
                }
                selectionModel.setSelected(selected, "tree_controller");
            });
        };

        return TreeController;
    });