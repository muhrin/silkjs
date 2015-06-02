/**
 * Created by uhrin on 20/05/15.
 */
define(["scenejs"], function (sjs) {
    'use strict';

    var my = {};

    my.Factory = function() {

    };

    my.Factory.create (worldObjectType) {
        creators[worldObjectType]();
    }



    return my;
});