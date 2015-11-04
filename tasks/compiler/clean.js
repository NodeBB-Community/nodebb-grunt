/*
 * Compiler: clean - Remove files/directories.
 *
 * All options get passed to the grunt-contrib-clean task.
 * See https://github.com/gruntjs/grunt-contrib-clean for more details.
 */

module.exports.process = function (module, options) {
  "use strict";

  var grunt = this;
  grunt.config.set("clean.step", options);

  return "clean:step";
};
