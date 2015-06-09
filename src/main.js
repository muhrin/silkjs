/**
 * Created by Maritn Uhrin on 18/05/15.
 */
require.config({
    "packages": ["webix", "scenejs"]
});

define([
        "./Atom",
        "./Crystal",
        "./SelectionModel",
        "./UnitCell",
        "./World",
        "webix",
        "scenejs",
        "./util",
        "require"
    ],
    function ns(
        Atom,
        Crystal,
        SelectionModel,
        UnitCell,
        World,
        webix,
        scenejs,
        _util) {
        'use strict';
        return _util.createPackage(ns, arguments);
    });