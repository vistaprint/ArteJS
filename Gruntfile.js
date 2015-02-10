/*jshint node:true*/
module.exports = function(grunt) {
    "use strict";

    var arteVersion = "0.3";
    var toolbarVersion = "0.3";
    var rangyVersion = "1.3alpha.804";

    var pluginsToBuildDebug = ["Editor/plugins/**/*.js"];
    var pluginsToBuildRelease = ["Build/Editor/plugins/**/*.min.js"];
    if (grunt.option("plugins")) {
        pluginsToBuildDebug = grunt.option("plugins").split(",").map(function(plugin) {
            return "Editor/plugins/" + plugin + ".js";
        });
        pluginsToBuildRelease = grunt.option("plugins").split(",").map(function(plugin) {
            return "Build/Editor/plugins/" + plugin + ".min.js";
        });
    }

    // Project configuration.
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true
            },
            all: [
                "Gruntfile.js",
                "<%=baseDir%>/Editor/core/**/*.js",
                "<%=baseDir%>/Editor/lib/extensions/*.js",
                "<%=baseDir%>/Editor/plugins/*.js",
                "<%=baseDir%>/Editor/toolbar/**/*.js",
                "<%=baseDir%>/Toolbar/**/*.js"
            ]
        },
        jscs: {

          all: {
            config: ".jscsrc",
            files: [{
              expand: true,
              cwd: "src",
              src: [
                "../Gruntfile.js",
                "../Editor/core/*.js",
                "../Editor/plugins/*.js",
                "../Toolbar/**/*.js"
              ]
            }]
          },

          soft: {
            config: ".jscsrc",
            options: {
              force: true
            },
            files: [{
              expand: true,
              cwd: "src",
              src: [
                "../Gruntfile.js",
                "../Editor/core/*.js",
                "../Editor/plugins/*.js",
                "../Toolbar/**/*.js"
              ]
            }]
          }

        },

        uglify: {
            options: {
            },
            build: {
                expand: true,
                cwd: "<%=baseDir%>",
                src: [
                    "Editor/Core/**/*.js",
                    "Editor/Plugins/**/*.js",
                    "Editor/Lib/**/*.js",
                    "Toolbar/**/*.js"
                ],
                dest: "Build",
                ext: ".min.js"
            }
        },

        concat: {
            RangyDebug: {
                src: ["Editor/lib/rangy-" + rangyVersion + "/**/*.js"],
                dest: "Release/rangy." + rangyVersion + ".debug.js"
            },
            RangyRelease: {
                src: ["Build/Editor/lib/rangy-" + rangyVersion + "/**/*.js"],
                dest: "Release/rangy." + rangyVersion + ".min.js"
            },
            EditorDebug: {
                src: [
                    "Editor/core/Arte.js",
                    "Editor/core/TextArea.js",
                    "Editor/core/Configuration.js",
                    "Editor/core/PluginManager.js",
                    "Editor/core/**/*.js",
                    "Editor/lib/jquery-extensions/**/*.js",
                    "Editor/lib/rangy-extensions/rangy-blockElementApplier.js",
                    "Editor/lib/rangy-extensions/rangy-inlineElementApplier.js",
                    "Editor/lib/rangy-extensions/rangy-elementApplierOptions.js",
                    "Editor/lib/rangy-extensions/richtextCommandApplier.js",
                    "Editor/lib/rangy-extensions/rangy-extensions.js"
                ].concat(pluginsToBuildDebug),
                dest: "Release/arte." + arteVersion + ".debug.js"
            },
            EditorRelease: {
                src: [
                    "Build/Editor/core/Arte.min.js",
                    "Build/Editor/core/TextArea.min.js",
                    "Build/Editor/core/Configuration.min.js",
                    "Build/Editor/core/**/*.min.js",
                    "Build/Editor/lib/jquery-extensions/**/*.min.js",
                    "Build/Editor/lib/rangy-extensions/rangy-blockElementApplier.min.js",
                    "Build/Editor/lib/rangy-extensions/rangy-inlineElementApplier.min.js",
                    "Build/Editor/lib/rangy-extensions/rangy-elementApplierOptions.min.js",
                    "Build/Editor/lib/rangy-extensions/richtextCommandApplier.min.js",
                    "Build/Editor/lib/rangy-extensions/rangy-extensions.min.js"
                ].concat(pluginsToBuildRelease),
                dest: "Release/arte." + arteVersion + ".min.js"
            },
            ToolbarDebug: {
                src: [
                "Toolbar/toolbar.js",
                "Toolbar/Buttons/ToolbarButtonBase.js",
                "Toolbar/Buttons/*.js",
                "Toolbar/*.js"
            ],
                dest: "Release/Toolbar." + toolbarVersion + ".debug.js"
            },
            ToolbarRelease: {
                src: ["Build/Toolbar/**/*.js"],
                dest: "Release/Toolbar." + toolbarVersion + ".min.js"
            }
        },

        qunit: {
            all: {
                options: {
                    urls: [
                        "http://localhost:8000/Editor/unittests/all.html"
                    ]
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: "."
                }
            }
        },
        clean: {
            options: {
                force: true
            },
            src: ["Build", "Release"]
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
                        "<%=baseDir%>/Editor/core/**/*.js",
                        "<%=baseDir%>/Editor/lib/rangy-extensions/*.js",
                        "<%=baseDir%>/Editor/lib/jquery-extensions/*.js",
                        "<%=baseDir%>/Editor/plugins/*.js",
                        "<%=baseDir%>/Editor/toolbar/**/*.js"
                    ]
                }
            }
        },
        baseDir: "./"
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-plato");

    // Default task.
    grunt.registerTask("default", ["build"]);
    grunt.registerTask("travis", ["verify", "build"]);
    grunt.registerTask("verify", ["clean", "jscs:soft", "jshint", "uglify", "concat", "connect", "qunit"]);
    grunt.registerTask("analysis", ["plato"]);
    grunt.registerTask("build", ["clean", "uglify", "concat"]);
    grunt.registerTask("all", ["build", "analysis"]);
};
