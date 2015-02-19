/*jshint node:true*/
module.exports = function(grunt) {
    "use strict";

    require("load-grunt-tasks")(grunt);

    // Project configuration.
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true
            },
            gruntfile: ["Gruntfile.js"],
            all: [
                "src/**/*.js"
            ]
        },
        jscs: {
            options: {
                config: ".jscsrc"
            },
            gruntfile: ["Gruntfile.js"],
            all: ["<%= jshint.all %>"]
        },
        uglify: {
            all: {
                files: {
                    "dist/arte.min.js": "dist/arte.js",
                    "dist/arte.editor.min.js": "dist/arte.editor.js",
                    "dist/arte.toolbar.min.js": "dist/arte.toolbar.js"
                }
            }
        },
        concat: {
            all: {
                src: [
                    "<%= concat.rangy.src %>",
                    "<%= concat.editor.src %>",
                    "<%= concat.toolbar.src %>",
                ],
                dest: "dist/arte.js"
            },

            rangy: {
                src: [
                    "external/rangy/lib/rangy-core.js",
                    "external/rangy/lib/rangy-selectionsaverestore.js"
                ],
                dest: "dist/rangy.js"
            },

            editor: {
                src: [
                    "src/editor/core/Arte.js",
                    "src/editor/core/TextArea.js",
                    "src/editor/core/Configuration.js",
                    "src/editor/core/PluginManager.js",
                    "src/editor/core/Commands.js",
                    "src/editor/core/Util.js",

                    "src/editor/lib/jquery-extensions/*.js",
                    "src/editor/lib/rangy-extensions/*.js",
                    "src/editor/plugins/*.js"
                ],
                dest: "dist/arte.editor.js"
            },

            toolbar: {
                src: [
                    "src/toolbar/toolbar.js",
                    "src/toolbar/Buttons/*.js",
                    "src/toolbar/Configuration.js",
                    "src/toolbar/SelectionManager.js"
                ],
                dest: "dist/arte.toolbar.js"
            }
        },
        qunit: {
            options: {
                coverage: {
                    timeout: 30000,
                    src: ["<%= jshint.all %>"],
                    instrumentedFiles: "reports/temp/",
                    htmlReport: "reports/coverage",
                    linesThresholdPct: 85

                }
            },
            all: ["tests/all.html"]
        },
        copy: {
            qunit: {
                files: [
                    {
                        expand: true,
                        cwd: "node_modules/qunitjs/qunit",
                        src: ["qunit.*"],
                        dest: "tests/dependencies/QUnit/"
                    },
                ]
            },
            jquery: {
                src: "node_modules/jquery/jquery.js",
                dest: "tests/dependencies/jquery.js"
            },
            rangy: {
                files: [
                    {
                        expand: true,
                        cwd: "node_modules/rangy",
                        src: [
                            "LICENSE",
                            "lib/rangy-core.js",
                            "lib/rangy-selectionsaverestore.js"
                        ],
                        dest: "external/rangy/"
                    },
                ]
            }
        },
        plato: {
            all: {
                options: {
                    logicalor: true,
                    switchcase: true,
                    forin: true,
                    trycatch: true,
                    jshint: grunt.file.readJSON(".jshintrc"),
                    exclude: /ThirdParty/
                },
                files: {
                    "reports/plato": ["src/**/*.js"]
                }
            }
        }
    });

    // Default task.
    grunt.registerTask("default", ["jscs", "jshint", "build", "qunit"]);
    grunt.registerTask("build", ["concat", "uglify"]);
    grunt.registerTask("travis", ["copy", "default"]);
    grunt.registerTask("analysis", ["plato"]);
    grunt.registerTask("all", ["build", "plato"]);
};
