module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      server: [
        'src/server/**/*.js',
        'test/server/**/*.js'
      ],
      client: [
        'Gruntfile.js',
        'src/client/**/*.js',
        '!src/client/js/intro.js',
        '!src/client/js/outro.js'
      ],
      clientconcat: ['dest/static/js/index.js']
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'coverage/blanket'
        },
        src: ['test/**/*.test.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html'
        },
        src: '<%= mochaTest.test.src %>'
      }
    },
    concat: {
      dist: {
        src: [
          'src/client/js/intro.js',
          'src/client/js/last-fm-album-art.js',
          'src/client/js/album-art-cache.js',
          'src/client/js/album-art-manager.js',
          'src/client/js/screensaver.js',
          'src/client/js/ui-controller.js',
          'src/client/js/main.js',
          'src/client/js/outro.js'
        ],
        dest: 'dest/static/js/index.js',
      },
    },
    copy: {
      server: {
        files: [
          {expand: true, cwd: 'src/', src: ['config.json'], dest: 'dest/', flatten: true},
          {expand: true, cwd: 'src/server/', src: ['*.js'], dest: 'dest/', flatten: true}
        ]
      },
      client: {
        files: [
          {expand: true, cwd: 'src/client/', src: ['**', '!**/js/**'], dest: 'dest/static'}
        ]
      }
    },
    watch: {
      files: ['src/client/**'],
      tasks: ['client']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', [
    'mochaTest',
    'jshint:server',
    'jshint:client',
    'concat',
    'jshint:clientconcat',
    'copy'
  ]);

  grunt.registerTask('server', [
    'mochaTest',
    'jshint:server',
    'copy:server'
  ]);

  grunt.registerTask('client', [
    'jshint:client',
    'concat',
    'jshint:clientconcat',
    'copy:client'
  ]);
};
