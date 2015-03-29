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

    getByKey: function (obj, key) {
      if (!key.length) {
        return obj;
      }
      if (obj === null || typeof obj !== "object") {
        return;
      }
      var parts = key.split(".");
      var _len = parts.length - 1;
      for (var i = 0; i < _len; i++) {
        var k = parts[i];
        if (typeof obj[k] === "object" && obj[k] !== null) {
          obj = obj[k];
        } else {
          return;
        }
      }
      return obj[parts[_len]];
    },

    setByKey: function (obj, key, value) {
      if (obj === null || typeof obj !== "object") {
        return;
      }
      var parts = key.split(".");
      var _len = parts.length - 1;
      for (var i = 0; i < _len; i++) {
        var k = parts[i];
        if (obj[k] === null || typeof obj[k] !== "object") {
          obj = obj[k] = {};
        } else {
          obj = obj[k];
        }
      }
      return obj[parts[_len]] = value;
    },

    loadTask: function (name, attrName) {
      if (helpers.tasks[name] != null) {
        return helpers.setByKey(gruntConfig, attrName, helpers.tasks[name].result);
      }
      if (typeof attrName !== "string") {
        attrName = name;
      }
      var result = require(path.join(config.cwd, "tasks", name));
      if (typeof result === "function") {
        result = result.call(grunt, config, helpers, gruntConfig);
      }
      if (result != null) {
        helpers.setByKey(gruntConfig, attrName, result);
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
      if (!grunt.file.exists(path.join(path.resolve("node_modules"), name, "package.json"))) {
        if (dependencies.hasOwnProperty(name)) {
          grunt.log.error(new Error("You need to run 'npm install' first."));
          process.exit(13);
        } else {
          //noinspection JSUnresolvedFunction
          if (optionalDependencies.hasOwnProperty(name)) {
            grunt.log.error(new Error("According to your configuration you need to install '" + name +
            "'. Try 'npm install " + name + "'"));
            process.exit(14);
          }
          grunt.log.warn("grunt-task '" + name + "' could not get resolved");
        }
      }
      grunt.loadNpmTasks(name);
    },

    readModule: function (id) {
      var result = grunt.file.readJSON(path.join(config.cwd, "modules", id + ".json"));
      if (result != null) {
        result.id = id;
      }
      return result;
    },

    findModules: function () {
      var p = path.join(config.cwd, "modules");
      if (!grunt.file.isDir(p)) {
        return config.modules = [];
      }
      var files = fs.readdirSync(p);
      return config.modules = _.compact(_.map(files, function (file) {
        if (path.extname(file) === ".json") {
          return helpers.readModule(path.basename(file, ".json"));
        }
      }));
    },

    getLicenseText: function (name) {
      return (config.licenses[name] || "").replace(/\n/g, grunt.util.linefeed);
    },

    getTextReplacer: function (regex, content) {
      return function (text) {
        return text.replace(regex, function (match, name) {
          if (content.hasOwnProperty(name)) {
            return content[name] || "";
          }
          return match;
        });
      };
    },

    getCompilation: function (key, dev) {
      return _.flatten(helpers.populateCompilation(key + (dev ? ".dev" : ".dist")));
    },

    populateCompilation: function (obj) {
      var type = typeof obj;
      if (type === "string") {
        return helpers.populateCompilation(helpers.getByKey(config.compilation, obj));
      }
      if (type !== "object") {
        throw new Error("Compilation-Config invalid.");
      }
      if (obj instanceof Array) {
        return _.map(obj, helpers.populateCompilation);
      }
      return [obj];
    }

  };

  return helpers;
};