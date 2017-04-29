/*
 * Compiler: typescript - Compile TypeScript files into JavaScript.
 *
 * All options get passed to the grunt-typescript task.
 * See https://github.com/k-maru/grunt-typescript for more details.
 */

module.exports = function (config, helpers, gruntConfig) {
  "use strict";

  var grunt = this;
  helpers.loadNpmTask("grunt-typescript");

  gruntConfig.typescript = {};

  return {
    process(module, options) {
      grunt.config.set("typescript.step", options);
      return "typescript:step";
    }
  };
};
