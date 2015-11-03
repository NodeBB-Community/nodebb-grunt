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
  helpers.loadDeepTask("publish", "git");
  helpers.loadDeepTask("publish", "npm");

  /*--------------------------- load all compilers that may get needed by any module-type  ---------------------------*/

  function getCompilerNames(compilation) {
    var arr = helpers.getCompilation(compilation, true).concat(helpers.getCompilation(compilation, false));
    return _.pluck(arr, "compiler");
  }

  _.each(_.uniq(_.flatten(_.map(_.pluck(config.types, "compilation"), getCompilerNames))), function (name) {
    helpers.loadCompiler(name);
  });

  /*---------------------------------------------- persist grunt-config ----------------------------------------------*/

  grunt.initConfig(gruntConfig);

  /*--------------------------------------------- add some (alias-)tasks ---------------------------------------------*/

  grunt.registerTask("compile", ["copy_tmp", "compilation", "copy_deploy"]);

  grunt.registerTask("set_commit_msg", function (msg) {
    grunt.config.set("git.commit", msg || null);
  });

  grunt.registerTask("set_development", "Enables/Sets development task-settings", function (val) {
    grunt.config.set("development", val !== "off" && val !== "false");
  });

  grunt.registerTask("dev", "Starts development-mode of specified module [compilation, watch]", function (id) {
    grunt.task.run("set_development", "set_active_module:" + id, "compile", "watch");
  });
  grunt.registerTask("dev_stop", "Starts development-mode of specified module [compilation]", function (id) {
    grunt.task.run("set_development", "set_active_module:" + id, "compile");
  });
  grunt.registerTask("dev_skip", "Starts development-mode of specified module [watch]", function (id) {
    grunt.task.run("set_development", "set_active_module:" + id, "watch");
  });

  grunt.registerTask("deploy", "Triggers deployment of specified module", function (id) {
    grunt.task.run("set_development:false", "set_active_module:" + id, "compile");
  });

  grunt.registerTask("publish", "Triggers publishing of specified module", function (id, commit) {
    if (commit != null) {
      grunt.config.set("git.commit", commit || null);
    }
    grunt.task.run("deploy:" + id, "npm", "git");
  });

  grunt.registerTask("default", "init");

};
