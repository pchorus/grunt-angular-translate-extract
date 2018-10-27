'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.angular_translate_extract = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/default_options');
    var expected = grunt.file.read('test/expected/default_options');
    test.equal(actual, expected, 'should extract texts correctly.');

    test.done();
  },
  custom_interpolation: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/custom_interpolation');
    var expected = grunt.file.read('test/expected/custom_interpolation');
    test.equal(actual, expected, 'should handle custom interpolation delimiters correctly.');

    test.done();
  },
  custom_regex: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/custom_regex');
    var expected = grunt.file.read('test/expected/custom_regex');
    test.equal(actual, expected, 'should handle custom regex correctly.');

    test.done();
  },
  no_source_file_output: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/no_source_file_output');
    var expected = grunt.file.read('test/expected/no_source_file_output');
    test.equal(actual, expected, 'should extract texts without source file info.');

    test.done();
  },
  no_source_file_line_output: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/no_source_file_line_output');
    var expected = grunt.file.read('test/expected/no_source_file_line_output');
    test.equal(actual, expected, 'should extract texts correctly.');

    test.done();
  },

};
