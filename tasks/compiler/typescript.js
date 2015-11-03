module.exports = function (config, helpers, gruntConfig) {
  "use strict";

  var grunt = this;
  helpers.loadNpmTask("grunt-typescript");

  gruntConfig.typescript = {};

  return {
    process: function (module, options) {
      grunt.config.set("typescript.step", options);
      return "typescript:step";
    }
  };
};
