module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        connect: {
            options:{
                keepalive: true
            },
            base: {
                hostname: "*",
                port: "8000",
                target: 'http://localhost:8000/tests/ts/',
                open: true
            }
        },
        typescript: {
            dist: {
                src: ['./src/**/*.ts'],
                options: {
                    module: 'amd',
                    target: 'es3',
                    sourceMap: false,
                    declaration: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['typescript']);

};