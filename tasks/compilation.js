"use strict";

var _ = require("underscore");

module.exports = function (config, helpers) {
  var grunt = this;

  grunt.registerTask("compilation", "Runs compilation of module as defined within config", function () {
    grunt.task.requires("set_active_module");
    var moduleData = grunt.config.get("modules.active");
    var dev = grunt.config.get("development");
    var compilationId = config.types[moduleData.type.id].compilation;

    grunt.task.run(_.flatten(_.compact(_.map(helpers.getCompilation(compilationId, dev), function (step) {
      var compiler = helpers.loadCompiler(step.compiler);
      return compiler.process(step);
    }))));
  });

  return {};
};
