"use strict";

module.exports = function (config, helpers) {
  var grunt = this;

  grunt.registerTask("compilation_step", "Runs iterative all compilation steps from config", function () {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }
    var steps = grunt.config.get("compilation.stack");
    var step = steps.shift();
    grunt.config.set("compilation.stack", steps);
    var compiler = helpers.loadCompiler(step.compiler);
    var result = compiler.process.call(grunt, moduleData, step, helpers);
    if (result instanceof Array || typeof result === "string") {
      grunt.task.run(result);
    }
    if (steps.length) {
      grunt.task.run("compilation_step");
    }
  });

  grunt.registerTask("compilation", "Runs compilation of module as defined within config", function () {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }
    var dev = grunt.config.get("development");
    var compilationId = config.types[moduleData.meta.type.id].compilation;

    grunt.task.run("increment_module_build");
    grunt.config.set("compilation.stack", helpers.getCompilation(compilationId, dev));
    if (grunt.config.get("compilation.stack").length) {
      grunt.task.run("compilation_step");
    }
  });

  return {};
};
