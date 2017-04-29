"use strict";

module.exports = function (config, helpers) {
  var grunt = this;

  helpers.loadNpmTask("grunt-contrib-copy");

  grunt.registerTask("copy_tmp", "Copies the active module into the tmp-dir for further processing", () => {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }

    grunt.config.set("copy.tmp", {
      files: [{
        expand: true,
        dot: true,
        cwd: moduleData.paths.source,
        src: ["**/*", "!.git/**/*", "!.git"], // TODO replace with mask within modules .npmignore or .gitignore
        dest: moduleData.paths.tmp
      }]
    });

    grunt.task.run("copy:tmp");
  });

  grunt.registerTask("copy_deploy", "Copies the active module into the deployment directory", () => {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }

    grunt.config.set("copy.deploy", {
      files: [{
        expand: true,
        dot: true,
        cwd: moduleData.paths.tmp,
        src: ["**/*", "!.git/**/*", "!.git"], // TODO replace with mask within modules .npmignore or .gitignore
        dest: moduleData.paths.destination
      }]
    });

    grunt.task.run("copy:deploy");
  });

  return {};

};
