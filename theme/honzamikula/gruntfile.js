module.exports = function(grunt) {

  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    autoprefixer: {
      options: {
        cascade: true
      },
      no_dest: {
        src: 'css/*.css'
      }
    },

    watch: {
      less: {
        files: ['less/**'],
        tasks: ['less', 'autoprefixer']
      },
      js: {
        files: ['js/**'],
        tasks: [''],
        options: {
          livereload: true,
        }
      },
      html: {
        files: ['views/**'],
        options: {
          livereload: true,
        }
      },
      css: {
        files: ['css/**'],
        options: {
          livereload: true
        }
      }
    },
    jshint: {
      all: ['gruntfile.js', 'js/**/*.js']
    },

    less: {
      development: {
        files: [
          {
            expand: true,
            cwd: "less",
            src: ['style.less'],
            dest: "css",
            ext: ".css"
          }
        ]
      }
    }
  });

  // Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-autoprefixer');

  // Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  // Default task(s).
  grunt.registerTask('default', ['less']);

	// Build task.
  grunt.registerTask('build', ['less']);

  // Run task.
  grunt.registerTask('run', []);


  // TODO: jshint
};
