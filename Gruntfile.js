"use strict";

var _ = require("lodash");
var path = require("path");

var cwd = __dirname;

/*================================================ Grunt entry-point  ================================================*/

module.exports = function (grunt) {
  var gruntConfig = {prompt: {}};

  /*-------------------------------------- load main services (config, helpers) --------------------------------------*/

  function loadService(name) {
    var result = require(path.join(cwd, "services", name));
    if (typeof result === "function") {
      var args = Array.prototype.splice.call(arguments, 1);
      result = result.apply(grunt, args);
    }
    return result;
  }

  var config = gruntConfig.cfg = loadService("config", cwd);
  var helpers = loadService("helpers", config, gruntConfig, loadService);

  /*------------------- apply modules-attribute to config that holds information about all modules -------------------*/

  helpers.findModules();

  /*--------------------------------------------------- load tasks ---------------------------------------------------*/

  // init
  helpers.loadDeepTask("init", "config");
  helpers.loadDeepTask("init", "project", "initProject");
  helpers.loadDeepTask("init", "copy");
  // compile
  helpers.loadTask("compilation");
  helpers.loadTask("modules");
  // watch
  helpers.loadTask("watch");
  // mixed
  helpers.loadTask("clean");
  helpers.loadTask("copy");
  // publish
  helpers.loadTask("publish");

  /*--------------------------- load all compilers that may get needed by any module-type  ---------------------------*/

  function getCompilerNames(compilation) {
    compilation = "sets." + compilation;
    var arr = helpers.getCompilation(compilation, true).concat(helpers.getCompilation(compilation, false));
    return _.pluck(arr, "compiler");
  }

  // load all compilers that may be executed by any existing type-definition (not null)
  _.each(_.uniq(_.flatten(_.map(_.pluck(_.compact(_.map(config.types, _.identity)), "compilation"), getCompilerNames))),
         function (name) { helpers.loadCompiler(name); });

  /*---------------------------------------------- persist grunt-config ----------------------------------------------*/

  grunt.initConfig(gruntConfig);

  /*--------------------------------------------- add some (alias-)tasks ---------------------------------------------*/

  grunt.registerTask("compile", ["clean_tmp", "copy_tmp", "compilation", "clean_deploy", "copy_deploy"]);

  grunt.registerTask("set_development", "Enables/Sets development task-settings", function (val) {
    grunt.config.set("development", val !== "false");
  });

  grunt.registerTask("dev", "Starts development-mode of specified module [compilation, watch_module]", function (id) {
    grunt.task.run("set_development", "set_active_module:" + id, "compile", "watch_module");
  });
  grunt.registerTask("dev_stop", "Starts development-mode of specified module [compilation]", function (id) {
    grunt.task.run("set_development", "set_active_module:" + id, "compile");
  });
  grunt.registerTask("dev_skip", "Starts development-mode of specified module [watch_module]", function (id) {
    grunt.task.run("set_development", "set_active_module:" + id, "watch_module");
  });

  grunt.registerTask("build", "Triggers distribution of specified module", function (id) {
    grunt.task.run("set_development:false", "set_active_module:" + id, "compile");
  });
  grunt.registerTask("publish", "Triggers publishing of specified module", function (id) {
    grunt.task.run("set_active_module:" + id, "publish_source", "publish_distribution");
  });

  grunt.registerTask("deploy", "Triggers build and publish of specified module", function (id) {
    grunt.task.run("build:" + id, "publish:" + id);
  });

  grunt.registerTask("default", "init");
};
