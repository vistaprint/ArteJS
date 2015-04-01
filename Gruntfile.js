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
            all: ["src/**/*.js"],
            tests: [
                "tests/**/*.js",
                "!tests/dependencies/**/*.js"
            ]
        },
        jscs: {
            options: {
                config: ".jscsrc"
            },
            gruntfile: ["Gruntfile.js"],
            all: ["<%= jshint.all %>"],
            tests: ["<%= jshint.tests %>"]
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
                    "<%= concat.toolbar.src %>"
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
            all: {
                options: {
                    urls: [
                        "tests/index.html?jquery=1.7.2",
                        "tests/index.html?jquery=1.8.3",
                        "tests/index.html?jquery=1.9.1",
                        "tests/index.html?jquery=1.10.2",
                        "tests/index.html?jquery=1.11.2",
                        "tests/index.html?jquery=2.0.0",
                        "tests/index.html?jquery=2.1.3"
                    ]
                }
            },
            single: ["tests/index.html"]
        },
        copy: {
            qunit: {
                files: [
                    {
                        expand: true,
                        cwd: "node_modules/qunitjs/qunit",
                        src: ["qunit.*"],
                        dest: "tests/dependencies/QUnit/"
                    }
                ]
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
                    }
                ]
            },
            qunitComposite: {
                files: [
                    {
                        expand: true,
                        cwd: "node_modules/qunit-composite",
                        src: ["qunit-composite.*"],
                        dest: "tests/dependencies/QUnit/"
                    }
                ]
            }
        },
        curl: {
            // Grab different versions of jQuery for unit testing
            // NOTE: that we should not be using "jquery-latest" anymore:
            // http://blog.jquery.com/2014/07/03/dont-use-jquery-latest-js/

            // Grab the latest version of each minor release

            // jQuery 1.x
            "tests/dependencies/jquery-1.7.2.js": "http://code.jquery.com/jquery-1.7.2.js",
            "tests/dependencies/jquery-1.8.3.js": "http://code.jquery.com/jquery-1.8.3.js",
            "tests/dependencies/jquery-1.9.1.js": "http://code.jquery.com/jquery-1.9.1.js",
            "tests/dependencies/jquery-1.10.2.js": "http://code.jquery.com/jquery-1.10.2.js",
            "tests/dependencies/jquery-1.11.2.js": "http://code.jquery.com/jquery-1.11.2.js",

            // jQuery 2.x - IE9+
            "tests/dependencies/jquery-2.0.0.js": "http://code.jquery.com/jquery-2.0.0.js",
            "tests/dependencies/jquery-2.1.3.js": "http://code.jquery.com/jquery-2.1.3.js"
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
    grunt.registerTask("default", ["jscs", "jshint", "build", "qunit:single"]);
    grunt.registerTask("build", ["concat", "uglify"]);
    grunt.registerTask("travis", ["copy", "curl", "default", "qunit:all"]);
    grunt.registerTask("analysis", ["plato"]);
    grunt.registerTask("all", ["build", "plato"]);
};
