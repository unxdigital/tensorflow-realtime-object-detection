module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    // includes files within path
                    {
                        expand: true,
                        cwd: './',
                        src: ['server.js'],
                        dest: 'dist/'
                    },
                ],
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['copy']);

};