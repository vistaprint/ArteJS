'use strict';

module.exports = function (grunt) {
    var arteVersion = "0.2";
    var toolbarVersion = "0.2";
    var rangyVersion = '1.3alpha.804';
    // Project configuration.
    grunt.initConfig({
        jshint: {
            jslint: {
                options: {
                    jshintrc: '.jshintrc',
                    reporter: 'jslint',
                    reporterOutput: 'reports/jshint_jslint.xml'
                },
                src: ['<%=baseDir%>/Editor/core/**/*.js', '<%=baseDir%>/Editor/lib/extensions/*.js', '<%=baseDir%>/Editor/plugins/*.js', '<%=baseDir%>/toolbar/**/*.js']
            },
            development: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['<%=baseDir%>/Editor/core/**/*.js', '<%=baseDir%>/Editor/lib/extensions/*.js', '<%=baseDir%>/Editor/plugins/*.js', '<%=baseDir%>/Editor/toolbar/**/*.js']
            }
        },

        uglify: {
            options: {
            },
            build: {
                expand: true,
                cwd: '<%=baseDir%>',
                src: ['Editor/Core/**/*.js', 'Editor/Plugins/**/*.js', 'Editor/Lib/**/*.js', 'Toolbar/**/*.js'],
                dest: 'Build',
                ext: '.min.js'
            }
        },

        concat: {
            RangyDebug: {
                src: ['Editor/lib/rangy-' + rangyVersion + '/**/*.js'],
                dest: 'Release/rangy.' + rangyVersion + '.debug.js'
            },
            RangyRelease: {
                src: ['Build/Editor/lib/rangy-' + rangyVersion + '/**/*.js'],
                dest: 'Release/rangy.' + rangyVersion + '.min.js'
            },
            EditorDebug: {
                src: ['Editor/core/Arte.js',
                'Editor/core/TextArea.js',
                'Editor/core/Configuration.js',
                'Editor/core/PluginManager.js',
                'Editor/core/**/*.js',
                'Editor/lib/jquery-extensions/**/*.js',
                'Editor/lib/rangy-extensions/rangy-blockElementApplier.js',
                'Editor/lib/rangy-extensions/rangy-inlineElementApplier.js',
                'Editor/lib/rangy-extensions/rangy-elementApplierOptions.js',
                'Editor/lib/rangy-extensions/richtextCommandApplier.js',
                'Editor/lib/rangy-extensions/rangy-extensions.js',
                'Editor/plugins/**/*.js'
            ],
                dest: 'Release/arte.' + arteVersion + '.debug.js'
            },
            EditorRelease: {
                src: ['Build/Editor/core/Arte.js',
                'Build/Editor/core/TextArea.js',
                'Build/Editor/core/Configuration.js',
                'Build/Editor/core/**/*.js',
                'Build/Editor/lib/jquery-extensions/**/*.js',
                'Build/Editor/lib/rangy-extensions/rangy-blockElementApplier.js',
                'Build/Editor/lib/rangy-extensions/rangy-inlineElementApplier.js',
                'Build/Editor/lib/rangy-extensions/rangy-elementApplierOptions.js',
                'Build/Editor/lib/rangy-extensions/richtextCommandApplier.js',
                'Build/Editor/lib/rangy-extensions/rangy-extensions.js',
                'Build/Editor/plugins/**/*.js'
            ],
                dest: 'Release/arte.' + arteVersion + '.min.js'
            },
            ToolbarDebug: {
                src: [
                'Toolbar/toolbar.js',
                'Toolbar/Buttons/ToolbarButtonBase.js',
                'Toolbar/Buttons/*.js',
                'Toolbar/*.js'
            ],
                dest: 'Release/Toolbar.' + toolbarVersion + '.debug.js'
            },
            ToolbarRelease: {
                src: ['Build/Toolbar/**/*.js'],
                dest: 'Release/Toolbar.' + toolbarVersion + '.min.js'
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
            src: ['Build', 'Release']
        },

        plato: {
            all: {
                options: {
                    logicalor: true,
                    switchcase: true,
                    forin: true,
                    trycatch: true,
                    jshint: grunt.file.readJSON('.jshintrc'),
                    exclude: /ThirdParty/
                },
                files: {
                    'reports/plato': ['<%=baseDir%>/Editor/core/**/*.js', '<%=baseDir%>/Editor/lib/rangy-extensions/*.js', '<%=baseDir%>/Editor/lib/jquery-extensions/*.js', '<%=baseDir%>/Editor/plugins/*.js', '<%=baseDir%>/Editor/toolbar/**/*.js']
                }
            }
        },
        baseDir: './'
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-plato");

    // Default task.
    grunt.registerTask('default', ['build']);
    grunt.registerTask('travis', ['build']);
    grunt.registerTask('verify', ["jshint:jslint", 'connect', "qunit"]);
    grunt.registerTask('analysis', ['plato']);
    grunt.registerTask('build', ['clean', 'uglify', 'concat', "verify"]);
    grunt.registerTask('all', ["build", 'analysis']);

};
