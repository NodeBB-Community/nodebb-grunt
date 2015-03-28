"use strict";

var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");

module.exports = function (config, gruntConfig, loadService) {
  var grunt = this;
  var dependencies = config.pkg.dependencies || {}, optionalDependencies = config.pkg.optionalDependencies || {};

  var helpers = {
    services: {
      config: config,
      helpers: helpers
    },
    tasks: {},

    loadService: function (name) {
      if (helpers.services[name] != null) {
        return helpers.services[name].result;
      }
      var result = loadService.apply(this, arguments);
      helpers.services[name] = {result: result};
      return result;
    },

    loadTask: function (name, attrName) {
      if (helpers.tasks[name] != null) {
        return gruntConfig[attrName] = helpers.tasks[name].result;
      }
      if (typeof attrName !== "string") {
        attrName = name;
      }
      var result = require(path.join(config.cwd, "tasks", name));
      if (typeof result === "function") {
        result = result.call(grunt, config, helpers, gruntConfig);
      }
      if (result != null) {
        gruntConfig[attrName] = result;
      }
      helpers.tasks[name] = {result: result};
      return result;
    },

    loadDeepTask: function (dir, name) {
      return helpers.loadTask(path.join(dir, name), name);
    },

    exec: function (cmd, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      grunt.log.ok("executing: " + cmd);
      grunt.log.ok("(within '" + process.cwd() + "')");
      childProcess.exec(cmd, options, function (err) {
        if (err != null) {
          grunt.log.error("command failed with exit-code [" + err.code + "]");
          grunt.log.error(err.message);
        } else {
          grunt.log.ok("command succeeded");
        }
        cb.apply(this, arguments);
      });
    },

    loadNpmTask: function (name) {
      try {
        require.resolve(name);
      } catch (e) {
        if (dependencies.hasOwnProperty(name)) {
          grunt.log.error(new Error("You need to run 'npm install' first."));
          process.exit(13);
        } else {
          //noinspection JSUnresolvedFunction
          if (optionalDependencies.hasOwnProperty(name)) {
            grunt.log.error(new Error("According to your configuration you need to install '" + name +
            "'. Try 'npm install " + name + "'"));
          }
          process.exit(14);
        }
        grunt.log.error(new Error("Grunt task not found: " + name));
        process.exit(15);
      }
      grunt.loadNpmTasks(name);
    },

    readModule: function (id) {
      var result = grunt.file.readJSON(path.join(config.cwd, "modules", id + ".json"));
      if (result != null) {
        result.id = id;
        if (result.hasOwnProperty("type") && !~config.moduleTypes.indexOf(result.type)) {
          config.moduleTypes.push(result.type);
        }
      }
      return result;
    },

    findModules: function () {
      var p = path.join(config.cwd, "modules");
      config.moduleTypes = ["plugin", "theme"];
      if (!grunt.file.isDir(p)) {
        return config.modules = [];
      }
      var files = fs.readdirSync(p);
      return config.modules = _.compact(_.map(files, function (file) {
        if (path.extname(file) === ".json") {
          return helpers.readModule(path.basename(file, ".json"));
        }
      }));
    }

  };

  return helpers;
};