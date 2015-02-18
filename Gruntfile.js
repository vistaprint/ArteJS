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
                "Editor/core/**/*.js",
                "Editor/lib/**/*.js",
                "Editor/plugins/**/*.js",
                "Editor/toolbar/**/*.js",
                "Toolbar/**/*.js",
                "!Editor/lib/rangy-1.3alpha.804/**"
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
                    "Editor/lib/rangy-1.3alpha.804/rangy-core.js",
                    "Editor/lib/rangy-1.3alpha.804/rangy-selectionsaverestore.js"
                ],
                dest: "dist/rangy.js"
            },

            editor: {
                src: [
                    "Editor/core/Arte.js",
                    "Editor/core/TextArea.js",
                    "Editor/core/Configuration.js",
                    "Editor/core/PluginManager.js",
                    "Editor/core/Commands.js",
                    "Editor/core/Util.js",

                    "Editor/lib/jquery-extensions/*.js",
                    "Editor/lib/rangy-extensions/*.js",
                    "Editor/plugins/*.js"
                ],
                dest: "dist/arte.editor.js"
            },

            toolbar: {
                src: [
                    "Toolbar/toolbar.js",
                    "Toolbar/Buttons/*.js",
                    "Toolbar/Configuration.js",
                    "Toolbar/SelectionManager.js"
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
                    "reports/plato": [
                        "Editor/core/**/*.js",
                        "Editor/lib/rangy-extensions/*.js",
                        "Editor/lib/jquery-extensions/*.js",
                        "Editor/plugins/*.js",
                        "Editor/toolbar/**/*.js",
                        "Toolbar/**/*.js"
                    ]
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
