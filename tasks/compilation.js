module.exports = function (config, helpers) {
  "use strict";
  var grunt = this;

  grunt.registerTask("compilation_step", "Runs iterative all compilation steps from config", () => {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }

    var steps = grunt.config.get("compilation.stack");
    var step = steps.shift();

    grunt.config.set("compilation.stack", steps);
    var compiler = helpers.loadCompiler(step.compiler);
    grunt.log.ok("Process '" + step.compiler + "' compilation");
    grunt.file.setBase(moduleData.paths.tmp);
    var result = compiler.process.call(grunt, moduleData, step, helpers);
    if (result instanceof Array || typeof result === "string") {
      grunt.task.run(result);
    }
    grunt.task.run("compilation_step_done");
    if (steps.length) {
      grunt.task.run("compilation_step");
    }
  });

  grunt.registerTask("compilation", "Runs compilation of module as defined within config", () => {
    var moduleData = grunt.config.get("modules.active");
    if (moduleData == null) {
      return grunt.fail.fatal("set_active_module must be run first");
    }

    var dev = grunt.config.get("development");
    var compilationId = "sets." + config.types[moduleData.meta.type.id].compilation;

    grunt.task.run("increment_module_build");
    grunt.config.set("compilation.stack", helpers.getCompilation(compilationId, dev));
    if (grunt.config.get("compilation.stack").length) {
      grunt.task.run("compilation_step");
    }
  });

  grunt.registerTask("compilation_step_done", "Resets the cwd", () => { grunt.file.setBase(config.cwd); });

  return {};
};
