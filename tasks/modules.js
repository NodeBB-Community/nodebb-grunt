"use strict";

var _ = require("lodash");
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
      var meta = helpers.getMetaData(id, grunt.file.readJSON(moduleFile).type);
      var type = config.types[meta.type.id];

      var metaReplaceData = type.setup.metaReplace,
          metaReplace = helpers.getReplacer(new RegExp(metaReplaceData.regex, "g"), meta);

      var sourcePath = path.join(config.cwd, metaReplace(config.paths.source.base));
      var moduleMetaFile = path.join(sourcePath, ".meta.json");
      if (grunt.file.exists(moduleMetaFile)) {
        _.extend(meta, grunt.file.readJSON(moduleMetaFile));
      }

      meta.paths = config.paths;

      data = {
        id: id,
        alias: alias,
        meta: meta,
        metaReplace: metaReplace,
        metaReplaceData: metaReplaceData,
        paths: {
          info: moduleFile,
          source: sourcePath,
          tmp: path.join(config.cwd, metaReplace(config.paths.tmp)),
          destination: path.join(config.cwd,
                                 metaReplace(config.paths.nodeBB.root),
                                 metaReplace(config.paths.nodeBB.deploy),
                                 metaReplace("nodebb-${type.name}-${id}"))
        }
      };

      delete meta.paths;

      grunt.config.set("modules.byId." + id, data);
    }

    grunt.config.set("modules.active", data);
  });

  grunt.registerTask("increment_module_build", "Increments the saved build-value of the active module", function () {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }

    var moduleMetaFile = path.join(moduleData.paths.source, ".meta.json");
    var moduleMetaTmpFile = path.join(moduleData.paths.tmp, ".meta.json");
    var moduleMeta = grunt.file.readJSON(moduleMetaFile);
    moduleMeta.build = ++moduleData.meta.build;
    grunt.config.set("modules.active", moduleData);
    grunt.file.write(moduleMetaFile, JSON.stringify(moduleMeta, null, 2));
    if (grunt.file.exists(moduleMetaTmpFile)) {
      grunt.file.write(moduleMetaTmpFile, JSON.stringify(moduleMeta, null, 2));
    }
  });

  return {};
};
