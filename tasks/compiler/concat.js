/*
 * Compiler: concat - Concatenate files.
 *
 * All options get passed to the grunt-contrib-concat task.
 * See https://github.com/gruntjs/grunt-contrib-concat for more details.
 */

module.exports = function (config, helpers, gruntConfig) {
  "use strict";

  var grunt = this;
  helpers.loadNpmTask("grunt-contrib-concat");

  gruntConfig.concat = {};

  return {
    process(module, options) {
      grunt.config.set("concat.step", options);
      return "concat:step";
    }
  };
};
