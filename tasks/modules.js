"use strict";

var path = require("path");

module.exports = function (config, helpers) {
  var grunt = this;

  grunt.registerTask("set_active_module", "Collects information about the given module", function (id) {
    var moduleFile = helpers.findModule(id), alias = id;
    if (!moduleFile || !grunt.file.exists(moduleFile)) {
      return grunt.fail.fatal("Module '" + id + "' not found.");
    }
    id = path.basename(moduleFile, ".json");

    var data;
    if ((data = grunt.config.get("modules.byId." + id)) == null) {
      var meta = helpers.getMetaData(id, grunt.file.readJSON(moduleFile));
      var type = config.types[meta.type.id];

      var metaReplaceData = type.setup.metaReplace,
          metaReplace = helpers.getReplacer(new RegExp(metaReplaceData.regex, "g"), meta);

      data = {
        id: id,
        alias: alias,
        meta: meta,
        metaReplace: metaReplace,
        metaReplaceData: metaReplaceData,
        paths: {
          info: moduleFile,
          source: path.join(config.cwd, metaReplace(config.paths.source.base)),
          tmp: path.join(config.cwd, metaReplace(config.paths.tmp)),
          destination: path.join(config.cwd, metaReplace(config.paths.deploy))
        }
      };

      grunt.config.set("modules.byId." + id, data);
    }

    grunt.config.set("modules.active", data);
  });

  grunt.registerTask("increment_module_build", "Increments the saved build-value of the active module", function () {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }
    var info = grunt.file.readJSON(moduleData.paths.info);
    info.build = ++moduleData.meta.build;
    grunt.config.set("modules.active", moduleData);
    grunt.file.write(moduleData.paths.info, JSON.stringify(info, null, 2));
  });

  return {};
};
