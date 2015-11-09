var _ = require("lodash");

module.exports = function (config, helpers) {
  "use strict";
  var grunt = this;

  _.each({
    source: "source",
    distribution: "destination"
  }, function (pathKey, configKey) {
    grunt.registerTask("publish_" + configKey, "Triggers " + configKey + " publish flow for active module.",
        function () {
          var moduleData = grunt.config.get("modules.active");
          if (moduleData == null) {
            return grunt.fail.fatal("set_active_module must be run first");
          }

          var commands = config.publish[configKey] || [];
          var publish = moduleData.meta.publish[configKey];
          if (publish instanceof Array) {
            grunt.log.ok("Module has custom commands, not using defaults.");
            commands = publish;
          } else if (typeof publish === "object") {
            grunt.log.ok("Module has custom commands, not using defaults.");
            commands = [publish];
          } else if (publish !== true) {
            grunt.log.ok("Module is configured to skip this step.");
            return;
          }

          var options = {cwd: moduleData.paths[pathKey]};
          var res;
          for (var i = 0; i < commands.length; i++) {
            res = helpers.exec(commands[i], options);
            if (res.error != null) {
              grunt.fail.fatal("Publish command failed. Aborting...");
            }
          }
        });
  });
};
