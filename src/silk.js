/**
 * Created by Maritn Uhrin on 18/05/15.
 */


// Start the main app logic.
requirejs(['silk/visualisation', 'silk/sceneJSView/view', "scenejs"],
    function (vis, view) {
        'use strict';

        SceneJS.setConfigs({
            pluginPath: "./bower_complonents/scenejs/api/latest/plugins"
        });

        window.silk = {vis: vis, sceneJSView: view};

        console.log("SilkJS loaded");
    });