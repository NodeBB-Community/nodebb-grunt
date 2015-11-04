/*
 * Compiler: copy - Copy files.
 *
 * All options get passed to the grunt-contrib-copy task.
 * See https://github.com/gruntjs/grunt-contrib-copy for more details.
 */

module.exports.process = function (module, options) {
  "use strict";

  var grunt = this;
  grunt.config.set("copy.step", options);

  return "copy:step";
};
