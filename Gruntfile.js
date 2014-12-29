module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      beforeconcat: [
        'Gruntfile.js',
        'src/**/*.js',
        '!src/client/js/intro.js',
        '!src/client/js/outro.js'
      ],
      afterconcat: ['dest/static/js/index.js']
    },
    concat: {
      dist: {
        src: [
          'src/client/js/intro.js',
          'src/client/js/last-fm-album-art.js',
          'src/client/js/album-art-cache.js',
          'src/client/js/screensaver.js',
          'src/client/js/ui-controller.js',
          'src/client/js/main.js',
          'src/client/js/outro.js'
        ],
        dest: 'dest/static/js/index.js',
      },
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src/', src: ['config.json'], dest: 'dest/', flatten: true},
          {expand: true, cwd: 'src/server/', src: ['*.js'], dest: 'dest/', flatten: true},
          {expand: true, cwd: 'src/client/', src: ['**', '!**/js/**'], dest: 'dest/static'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'copy']);
};
