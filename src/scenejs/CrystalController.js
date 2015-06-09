/**
 * Created by martin on 08/06/15.
 */
define(["./NodeController", "silk/Crystal", "silk/util"],
    function (NodeController, Crystal, util) {
        'use strict';

        var CrystalController = function () {
            NodeController.call(this, Crystal.TYPE);
        };
        util.extend(NodeController, CrystalController);


        CrystalController.prototype.createNode = function (crystal) {
            return null;
        };

        return CrystalController;
    });