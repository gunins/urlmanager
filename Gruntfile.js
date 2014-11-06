module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['target', 'dist'],
        exec: {
            npmpack: 'npm pack dist',
            publish: 'npm publish dist'
        },
        requirejs: {
            prod: {
                options: {
                    baseUrl: 'src',
                    optimize: 'uglify2',
                    removeCombined: true,
                    dir: 'target',
                    modules: [
                        {
                            name: 'router/Router'
                        }
                    ]
                }
            }
        },
        copy: {
            prod: {
                files: [
                    {expand: true, cwd: './', src: ['package.json', 'bower.json', 'README.md'], dest: 'dist'},
                    {expand: true, cwd: './target', src: ['./**'], dest: 'dist/'}

                ]
            }
        },
        docco: {
            debug: {
                src: ['src/router/*.js'],
                options: {
                    output: 'dist/docs/'
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                commit: false,
                createTag: true,
                tagName: '%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false
            }
        },
        connect: {
            options: {
                keepalive: true
            },
            base: {
                hostname: "*",
                port: "8000",
                target: 'http://localhost:8000/tests/ts/',
                open: true
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['clean', 'requirejs', 'copy', 'docco']);
    grunt.registerTask('publish', ['bump', 'default', 'exec:publish']);

};