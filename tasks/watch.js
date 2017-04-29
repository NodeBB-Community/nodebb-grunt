"use strict";

var path = require("path");

module.exports = function (config, helpers) {
  var grunt = this;

  helpers.loadNpmTask("grunt-contrib-watch");

  grunt.registerTask("watch_module", "Watch for file changes within active module", () => {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }
    var dev = grunt.config.get("development") || false;
    grunt.config.set("watch.module", {
      files: [path.join(moduleData.paths.source, "**/*")],
      tasks: ["set_development:" + dev, "set_active_module:" + moduleData.id, "compile"],
      options: {interrupt: true, debounceDelay: 200}
    });
    grunt.task.run("watch:module");
  });

  return {};
};
