/*
 * grunt-angular-translate-extract
 * https://github.com/pchorus/grunt-angular-translate-extract
 *
 * Copyright (c) 2015 Pascal Chorus
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    angular_translate_extract: {
      default_options: {
        files: {
          'tmp/default_options': ['test/fixtures/example.html', 'test/fixtures/example.js']
        }
      },
      no_source_file_output: {
        extractSourceFiles: false,
        files: {
          'tmp/no_source_file_output': ['test/fixtures/example.html', 'test/fixtures/example.js']
        }
      },
      no_source_file_line_output: {
        extractSourceFilesLine: false,
        files: {
          'tmp/no_source_file_line_output': ['test/fixtures/example.html', 'test/fixtures/example.js']
        }
      },
      custom_interpolation: {
        interpolation: {
          startDelimiter: '[[',
          endDelimiter: ']]'
        },
        files: {
          'tmp/custom_interpolation': ['test/fixtures/example.html', 'test/fixtures/example.js']
        }
      },
      custom_regex: {
        customRegex: ['\\$translate\\s*:\\s*\'((?:\\\\.|[^\'\\\\])*)\''],
        files: {
          'tmp/custom_regex': ['test/fixtures/custom_regex.js']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  
  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'angular_translate_extract', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
