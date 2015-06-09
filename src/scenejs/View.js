/**
 * Created by Martin Uhrin on 20/05/15.
 */
define(["./SceneManager", "silk/World", "require"],
    function (SceneManager, World) {
        'use strict';

        var View = function (world, canvasId) {
            // Private properties
            var _world = typeof world !== 'undefined' ? world : new World();
            var _sceneManager = new SceneManager(_world, canvasId);
        };

        return View;
    });