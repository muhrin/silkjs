//Wrapper function with one parameter
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        bowercopy: {
            options: {
                srcPrefix: 'bower_components'
            },
            libs: {
                options: {
                    destPrefix: 'src/lib'
                },
                files: {
                    'require.js': 'requirejs/require.js',
                    'gl-matrix.js': 'gl-matrix/dist/gl-matrix.js',
                    'scenejs.js': 'scenejs/api/latest/scenejs.js'
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-bowercopy');

    // What to do by default. In this case, nothing.
    //grunt.registerTask('default', []);
    grunt.registerTask('default', ['bowercopy']);
};
