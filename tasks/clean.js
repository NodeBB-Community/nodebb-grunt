"use strict";

var _ = require("lodash");

module.exports = function (config, helpers) {
  var grunt = this;

  helpers.loadNpmTask("grunt-contrib-clean");

  grunt.registerTask("clean_tmp", "Cleans the temporary data of the active module", function () {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }
    grunt.config.set("clean.active", [moduleData.paths.tmp]);
    grunt.task.run("clean:active");
  });

  grunt.registerTask("clean_deploy", "Cleans the deployment data of the active module", function () {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }
    grunt.config.set("clean.active", [moduleData.paths.destination]);
    grunt.task.run("clean:active");
  });

  return {
    all: _.values(config.paths.clean)
  };
};
