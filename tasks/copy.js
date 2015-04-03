"use strict";

module.exports = function (config, helpers) {
  var grunt = this;

  helpers.loadNpmTask("grunt-contrib-copy");

  grunt.registerTask("copy_tmp", "Copies the active module into the tmp-dir for further processing", function () {
    grunt.task.requires("set_active_module");
    var moduleData = grunt.config.get("modules.active");

    grunt.config.set("copy.tmp", {
      expand: true,
      cwd: moduleData.paths.source,
      src: "**/*",
      dest: moduleData.paths.tmp
    });

    grunt.task.run("copy:tmp");
  });

  // TODO create copy_deploy task

};
