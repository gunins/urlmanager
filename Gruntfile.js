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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default');

};