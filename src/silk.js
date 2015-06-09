/**
 * Created by Maritn Uhrin on 18/05/15.
 */
define([
        'silk/atom',
        'silk/crystal',
        'silk/unitCell',
        'silk/world',
        'silk/sceneJSView/view',
        "scenejs"],
    function (Atom, Crystal, UnitCell, World, view) {
        'use strict';

        //SceneJS.setConfigs({
        //    pluginPath: "./bower_complonents/scenejs/api/latest/plugins"
        //});

        var my = {
            Atom: Atom,
            Crystal: Crystal,
            UnitCell: UnitCell,
            World: World,
            view: view
        };


        console.log("SilkJS loaded: " + my.silk);

        return my;
    });