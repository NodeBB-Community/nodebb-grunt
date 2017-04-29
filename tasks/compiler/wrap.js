/*
 * Compiler: wrap - Wrap file contents.
 *
 * All options get passed to the grunt-wrap task.
 * See https://github.com/chrissrogers/grunt-wrap for more details.
 */

module.exports = function (config, helpers, gruntConfig) {
  "use strict";

  var grunt = this;
  helpers.loadNpmTask("grunt-wrap");

  gruntConfig.uglify = {};

  return {
    process(module, options) {
      grunt.config.set("wrap.step", options);
      return "wrap:step";
    }
  };
};
