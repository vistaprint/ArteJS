'use strict';

module.exports = function(grunt)
{
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
                src: ['Editor/lib/rangy-1.2.3/**/*.js'],
                dest: 'Release/v0.1/rangy.debug.js'
            },
            RangyRelease: {
                src: ['Build/Editor/lib/rangy-1.2.3/**/*.js'],
                dest: 'Release/v0.1/rangy.min.js'
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
                dest: 'Release/v0.1/arte.debug.js'
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
                dest: 'Release/v0.1/arte.min.js'
            },
            ToolbarDebug: {
                src: [
                'Toolbar/toolbar.js',
                'Toolbar/Buttons/ToolbarButtonBase.js',
                'Toolbar/Buttons/*.js',
                'Toolbar/*.js'
            ],
                dest: "Release/v0.1/Toolbar.debug.js"
            },
            ToolbarRelease: {
                src: ['Build/Toolbar/**/*.js'],
                dest: "Release/v0.1/Toolbar.min.js"
            }

        },

        qunit: {
            all: ["<%=baseDir%>/Editor/unittests/all.html"]
        },

        clean: {
            options: {
                force: true
            },
            src: ['reports/!(plato)', 'Build', 'Release']
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

        karma: {
            unitBuild: {
                configFile: 'karma.conf.js',
                reporters: ['junit']
            },
            unitDeploy: {
                configFile: 'karma.conf.js'
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
    grunt.loadNpmTasks("grunt-plato");
    grunt.loadNpmTasks("grunt-karma");
    
    // Default task.
    grunt.registerTask('default', ['build']);
    grunt.registerTask('verify', ["jshint:jslint", "qunit"]);
    grunt.registerTask('analysis', ['karma:unitDeploy', 'plato']);
    grunt.registerTask('build', ['clean', 'uglify', 'concat', "verify"]);
    grunt.registerTask('all', ["build", 'analysis']);

};
