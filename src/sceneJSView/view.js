/**
 * Created by Martin Uhrin on 20/05/15.
 */
define(["silk/sceneJSView/nodeManagers", "silk/visualisation"],
    function (sceneman, vis) {
        'use strict';

        var my = {};

        my.View = function (world, canvasId) {
            // Private properties
            var _world = typeof world !== 'undefined' ? world : new vis.World();
            var _sceneManager = sceneman.SceneManager(_world, canvasId);
        };

        return my;
    });