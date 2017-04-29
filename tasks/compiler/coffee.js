/*
 * Compiler: coffee - Compile CoffeeScript files into JavaScript.
 *
 * All options get passed to the grunt-contrib-coffee task.
 * See https://github.com/gruntjs/grunt-contrib-coffee for more details.
 */

module.exports = function (config, helpers, gruntConfig) {
  "use strict";

  var grunt = this;
  helpers.loadNpmTask("grunt-contrib-coffee");

  gruntConfig.coffee = {};

  return {
    process(module, options) {
      grunt.config.set("coffee.step", options);
      return "coffee:step";
    }
  };
};
