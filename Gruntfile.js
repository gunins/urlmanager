module.exports = function(grunt) {

    grunt.initConfig({
        pkg:                   grunt.file.readJSON('package.json'),
        clean:                 ['target', 'dist', 'tmp'],
        exec:                  {
            npmpack: 'npm pack dist',
            publish: 'npm publish dist'
        },
        requirejs:             {
            prod: {
                options: {
                    baseUrl:        'src',
                    optimize:       'none',
                    removeCombined: true,
                    dir:            'target/es6/prod',
                    paths:          {
                        'babel/polyfill': '../node_modules/babel-polyfill/dist/polyfill'
                    },
                    modules:        [
                        {
                            name: 'router/Router'
                        },
                        {
                            name: 'babel/polyfill'
                        }
                    ]
                }
            }
        },
        copy:                  {
            prod: {
                files: [
                    {expand: true, cwd: './', src: ['package.json', 'bower.json', 'README.md'], dest: 'dist'},
                    {expand: true, cwd: './target', src: ['./**/*'], dest: 'dist'},

                ]
            },
            dev:{
                files:[
                    {expand: true, cwd: './src', src: ['./**'], dest: 'target/es6/dev'},
                    {expand: true, cwd: './node_modules/babel-polyfill/dist/', src: ['polyfill.js'], dest: 'target/es6/dev/babel'}
                ]
            }
            
        },
        babel:                 {
            options: {
                presets: ['es2015'],
                compact: false
            },
            dev:     {
                options: {
                    sourceMap: true
                },
                files:   [{
                    expand: true,
                    cwd:    'target/es6/dev',
                    src:    '**/*.js',
                    dest:   'target/es5/dev'
                }]
            },
            prod:    {
                options: {
                    sourceMap: false
                },
                files:   [{
                    expand: true,
                    cwd:    'target/es6/prod',
                    src:    '**/*.js',
                    dest:   'target/es5/prod'
                }]
            }
        },
        uglify:                {
            options:  {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            prod:     {
                files: [{
                    expand: true,
                    cwd:    'target/es5/prod',
                    src:    '**/*.js',
                    dest:   'target/es5/prod'
                }]
            },
            polyfill: {src: ['target/es6/prod/babel/polyfill.js'], dest: 'target/es5/prod/babel/polyfill.js'},
            //main:     {src: ['target/es6/main.js'], dest: 'target/es6/main.js'}

        },
        docco:                 {
            debug: {
                src:     ['src/router/*.js'],
                options: {
                    output: 'dist/docs/'
                }
            }
        },
        bump:                  {
            options: {
                files:       ['package.json', 'bower.json', 'dist/package.json', 'dist/bower.json'],
                commit:      true,
                commitFiles: ['package.json', 'bower.json', 'dist/*'],
                createTag:   true,
                tagName:     '%VERSION%',
                tagMessage:  'Version %VERSION%',
                push:        true,
                pushTo:      'origin'
            }
        },
        mocha_require_phantom: {
            options: {
                base:       'test',
                main:       'test-bootstrap',
                requireLib: '../node_modules/requirejs/require.js',
                files:      ['./routerTest.js']
            },
            target:  {}
        },
        mochaTest:             {
            options: {
                reporter:          'spec',
                captureFile:       'target/results.txt', // Optionally capture the reporter output to a file
                quiet:             false, // Optionally suppress output to standard out (defaults to false)
                clearRequireCache: true // Optionally clear the require cache before running tests (defaults to false)
            },
            test:    {
                src: ['test/routerTest.js']
            }
        },
        connect:               {
            options: {
                keepalive: true
            },
            base:    {
                hostname: "*",
                port:     "8000",
                target:   'http://localhost:8000/',
                open:     true
            }
        }
    });

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-require-phantom');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['mocha_require_phantom', 'mochaTest']);
    grunt.registerTask('default', ['clean', 'requirejs', 'copy:dev', 'babel', 'uglify', 'copy:prod', 'test', 'docco']);
    grunt.registerTask('publish', ['default', 'bump', 'exec:publish']);

};