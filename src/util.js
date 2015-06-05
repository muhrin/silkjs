/**
 * Created by uhrin on 19/05/15.
 */
define(function () {
    'use strict';

    return {

        extendArray: function (toExtend, using) {
            if (using.length === 0) {
                return;
            }
            using.forEach(function (v) {
                this.push(v);
            }, toExtend);
        },

        /**
         * Subclass a base class by chaining the prototype and setting the
         * constructor back to the subclass.
         *
         * @param base the class to be extended
         * @param sub the class extending the base
         */
        extend: function (base, sub) {
            var key, origProto = sub.prototype;
            sub.prototype = Object.create(base.prototype);
            // Reset any properties in the original prototype back to what they were
            for (key in origProto) {
                sub.prototype[key] = origProto[key];
            }
            // Reset the constructor back to the correct one
            sub.prototype.constructor = sub;
            // Make the constructor non-enumerable
            Object.defineProperty(sub.prototype, 'constructor', {
                enumerable: false,
                value: sub
            });
        },

        /**
         * Merge the properties of one object into another.
         *
         * @param what The object whose properties will be merged
         * @param into The object to merge the properties into
         */
        merge: function (what, into) {
            var name;
            for (name in what) {
                into[name] = what[name];
            }
        },

        /**
         * Check if something is an array or not.
         *
         * @param what What to check.
         * @returns {boolean} true if a built-in Array type, false otherwise.
         */
        isArray: function (what) {
            return (!!what) && (what.constructor === Array);
        },

        isObject: function (what) {
            return (!!what) && (what.constructor === Object);
        },

        getProperty: function (obj, desc) {
            obj = obj || window;
            var arr = desc.split(".");
            while (arr.length) {
                if (!obj.hasOwnProperty(arr[0])) {
                    throw new Error("Object has no property" + arr[0]);
                }
                obj = obj[arr.shift()];
            }
            return obj;
        },

        setProperty: function (obj, desc, val) {
            var arr = desc.split(".");
            while (arr.length > 1) {
                if (!obj.hasOwnProperty(arr[0])) {
                    throw new Error("Object has no property" + arr[0]);
                }
                obj = obj[arr.shift()];
            }
            return obj[arr.shift()] = val;
        }
    };

});