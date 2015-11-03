module.exports = function (config, helpers, gruntConfig) {
  "use strict";

  var grunt = this;
  helpers.loadNpmTask("grunt-contrib-coffee");

  gruntConfig.coffee = {};

  return {
    process: function (module, options) {
      grunt.config.set("coffee.step", options);
      return "coffee:step";
    }
  };
};
