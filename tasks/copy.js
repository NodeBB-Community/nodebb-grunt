"use strict";

var path = require("path");

module.exports = function (config, helpers) {
  var grunt = this;

  grunt.registerTask("copy_tmp", "Copies a specified module into the tmp-dir for further processing", function (id) {
    var moduleFile = path.join(config.cwd, "modules", id + ".json");
    if (!grunt.file.exists(moduleFile)) {
      grunt.fail.fatal("Module '" + id + "' not found.");
    }

    var meta = helpers.getMetaData(id, grunt.file.readJSON(moduleFile));
    var type = config.types[meta.type.id];

    var metaReplaceData = type.setup.metaReplace,
        metaReplace = helpers.getReplacer(new RegExp(metaReplaceData.regex, "g"), meta);

    var source = path.join(config.cwd, metaReplace(config.paths.source.base));
    var destination = path.join(config.cwd, metaReplace(config.paths.tmp));

    grunt.config.set("copy.tmp", {
      expand: true,
      cwd: source,
      src: "**/*",
      dest: destination
    });

    grunt.task.run("copy:tmp");
  });

};
