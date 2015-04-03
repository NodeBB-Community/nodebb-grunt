"use strict";

var path = require("path");

module.exports = function (config, helpers) {
  var grunt = this;

  grunt.registerTask("set_active_module", "Collects information about the given module", function (id) {
    var moduleFile = helpers.findModule(id);
    if (!moduleFile || !grunt.file.exists(moduleFile)) {
      grunt.fail.fatal("Module '" + id + "' not found.");
    }

    var data;
    if ((data = grunt.config.get("modules.byId." + id)) == null) {
      var meta = helpers.getMetaData(id, grunt.file.readJSON(moduleFile));
      var type = config.types[meta.type.id];

      var metaReplaceData = type.setup.metaReplace,
          metaReplace = helpers.getReplacer(new RegExp(metaReplaceData.regex, "g"), meta);

      data = {
        id: id,
        meta: meta,
        metaReplace: metaReplace,
        metaReplaceData: metaReplaceData,
        paths: {
          source: path.join(config.cwd, metaReplace(config.paths.source.base)),
          tmp: path.join(config.cwd, metaReplace(config.paths.tmp)),
          destination: path.join(config.cwd, metaReplace(config.paths.deploy))
        }
      };

      grunt.config.set("modules.byId." + id, data);
    }

    grunt.config.set("modules.active", data);
  });

  return {};
};
