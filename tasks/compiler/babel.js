/*
 * Compiler: babel - Use next generation JavaScript, today.
 *
 * All options get passed to the grunt-babel task.
 * See https://github.com/babel/grunt-babel for more details.
 */
module.exports = function (config, helpers, gruntConfig) {
  "use strict";

  var grunt = this;
  helpers.loadNpmTask("grunt-babel");

  gruntConfig.babel = {};

  return {
    process(module, options) {
      grunt.config.set("babel.step", options);
      return "babel:step";
    }
  };
};
