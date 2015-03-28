"use strict";

var _ = require("underscore");
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
      args.unshift(grunt);
      result = result.apply(grunt, args);
    }
    return result;
  }

  var config = gruntConfig.cfg = loadService("config", cwd);
  var helpers = loadService("helpers", config, gruntConfig, loadService);

  /*------------------- apply modules-attribute to config that holds information about all modules -------------------*/

  helpers.findModules();

  /*--------------------------------------------------- load tasks ---------------------------------------------------*/

  helpers.loadTask("init/config", "config");
  helpers.loadTask("init/project", "initProject");
  //loadTask("clean");
  //loadTask("watch");
  //loadTask("publish/git", "git");
  //loadTask("publish/npm", "publish");

  /*--------------------------- load all compilers that may get needed by any module-type  ---------------------------*/

  var compilation = config.compilation;

  function loadCompilers(val) {
    _.each(_.compact(_.pluck(compilation.flows[val], "compiler")), function (name) {
      helpers.loadDeepTask("compiler", name);
    });
  }

  _.each(compilation.dev, loadCompilers);
  _.each(compilation.dist, loadCompilers);

  /*---------------------------------------------- persist grunt-config ----------------------------------------------*/

  grunt.initConfig(gruntConfig);

  /*------------------------------------------------ add alias tasks  ------------------------------------------------*/

  // TODO

};