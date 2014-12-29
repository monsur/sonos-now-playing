module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js']
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src/', src: ['config.json'], dest: 'dest/', flatten: true},
          {expand: true, cwd: 'src/server/', src: ['*.js'], dest: 'dest/', flatten: true},
          {expand: true, cwd: 'src/client/', src: ['**'], dest: 'dest/static'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['jshint', 'copy']);
};
