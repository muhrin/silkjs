/**
 * Created by martin on 08/06/15.
 */
define(["./NodeController", "silk/util", "silk/World"],
    function (NodeController, util, World) {
        'use strict';

        var WorldController = function () {
            NodeController.call(this, World.TYPE);
        };
        util.extend(NodeController, WorldController);

        WorldController.prototype.createNode = function (world) {
            // Nothing to do: the world is as it is
            return null;
        };

        return WorldController;
    });