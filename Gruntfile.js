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
  helpers.loadTask("init/copy", "copy.init");
  // TODO implement other tasks

  /*--------------------------- load all compilers that may get needed by any module-type  ---------------------------*/

  function loadCompilers(val) {
    var comp = config.compilation;
    var compilers = _.pluck(comp[val.dev], "compiler").concat(_.pluck(comp[val.dist], "compiler"));
    _.each(_.uniq(_.compact(compilers)), function (name) {
      helpers.loadDeepTask("compiler", name);
    });
  }

  _.each(_.pluck(config.types, "compilation"), loadCompilers);

  /*---------------------------------------------- persist grunt-config ----------------------------------------------*/

  grunt.initConfig(gruntConfig);

  /*------------------------------------------------ add alias tasks  ------------------------------------------------*/

  // TODO create some aliases (e.g. default)

};