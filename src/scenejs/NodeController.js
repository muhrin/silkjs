/**
 * Created by martin on 08/06/15.
 */
define(function () {
    'use strict';

    var NodeController = function (worldObjectType) {
        if (this.constructor === NodeController) {
            throw new Error("Cannot instantiate abstract class NodeManager");
        }
        // Private properties
        var _sceneMan = null, _worldObjectType = worldObjectType;

        this._attach = function (sceneMan) {
            _sceneMan = sceneMan;
        };
        this._detach = function () {
            _sceneMan = null;
        };

        this.sceneManager = function () {
            return _sceneMan;
        };

        this.world = function () {
            return _sceneMan.world();
        };

        this.scene = function () {
            return _sceneMan.scene();
        };

        this.worldObjectType = function () {
            return _worldObjectType;
        };
    };

    NodeController.prototype.createNode = function (worldObject) {
        throw new Error("Abstract method");
    };
    NodeController.prototype.attach = function (sceneManager) {
        this._attach(sceneManager);
        this.worldAttached();
    };
    NodeController.prototype.detach = function () {
        this.worldDetaching();
        this._detach();
    };
    NodeController.prototype.getLibraryNodes = function () {
        return [];
    };
    NodeController.prototype.worldAttached = function () {
    };
    NodeController.prototype.worldDetaching = function () {
    };

    NodeController.prototype.getModelAttributes = function () {
        return null;
    };

    return NodeController;
});