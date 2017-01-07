module.exports = function(grunt) {

    //All configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            image: 'dist/img',
            html: 'dist',
            css: 'dist/css',
            js: 'dist/js/**/*.js'
        },
        cssmin: {
            src: {
                files: [{
                    expand: true,
                    cwd: 'src/css',
                    src: '*.css',
                    dest: 'dist/css'
                }]
            }
        },
        uglify: {
            src: {
                files: [{
                    expand: true,
                    cwd: 'src/js',
                    src: '*.js',
                    dest: 'dist/js'
                }, {
                    expand: true,
                    cwd: 'src/js/lib',
                    src: '*.js',
                    dest: 'dist/js/lib'
                }]
            }
        },
        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 7
                },
                files: [{
                    expand: true,
                    cwd: 'src/img/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'dist/img/'
                }]
            }
        },

        htmlmin: {
            options: {
                removeComments: true,
                removeCommentsFromCDATA: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true
            },
            html: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['*.html'],
                    dest: 'dist'
                }]
            }
        }

    });

    //Tell grunt we plan to use this plug-in
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    //Tell grunt what to do when we type "grunt" into the terminal
    grunt.registerTask('default', [
        'clean',
        'imagemin',
        'cssmin',
        'uglify',
        'htmlmin'
    ]);

}