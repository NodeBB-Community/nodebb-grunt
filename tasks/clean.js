"use strict";

var _ = require("underscore");

module.exports = function (config, helpers) {
  var grunt = this;

  helpers.loadNpmTask("grunt-contrib-clean");

  grunt.registerTask("clean_tmp", "Cleans the temporary data of the active module", function () {
    grunt.task.requires("set_active_module");
    var moduleData = grunt.config.get("modules.active");
    grunt.config.set("clean.active", [moduleData.paths.tmp]);
    grunt.task.run("clean:active");
  });

  grunt.registerTask("clean_deploy", "Cleans the deployment data of the active module", function () {
    grunt.task.requires("set_active_module");
    var moduleData = grunt.config.get("modules.active");
    grunt.config.set("clean.active", [moduleData.paths.destination]);
    grunt.task.run("clean:active");
  });

  return {
    all: _.values(config.paths.clean)
  };
};
