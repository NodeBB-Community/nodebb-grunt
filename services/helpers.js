"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");

var now = new Date();
var MODULE_META_STATICS = {
  YYYY: now.getFullYear(),
  DD: now.getDay() >= 10 ? now.getDay() : "0" + now.getDay(),
  MM: now.getMonth() >= 10 ? now.getMonth() : "0" + now.getMonth()
};

// TODO separate into multiple services (in the this file should be removed)

module.exports = function (config, gruntConfig, loadService) {
  var grunt = this;
  var dependencies = config.pkg.dependencies || {};
  var optionalDependencies = config.pkg.optionalDependencies || {};

  //noinspection JSUnusedGlobalSymbols
  var helpers = {
    services: {
      config,
      helpers
    },
    tasks: {},

    loadService(name) {
      if (helpers.services[name] != null) {
        return helpers.services[name].result;
      }
      var result = loadService.apply(this, arguments);
      helpers.services[name] = {result};
      return result;
    },

    getByKey(obj, key) {
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

    setByKey(obj, key, value) {
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

    loadTask(name, attrName) {
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
      helpers.tasks[name] = {result};
      return result;
    },

    loadDeepTask(dir, name, attrName) {
      return helpers.loadTask(path.join(dir, name), attrName || name);
    },

    loadCompiler(name, attrName) {
      return helpers.loadTask(path.join("compiler", name), attrName || name + "Compiler");
    },

    exec(cmd, options) {
      if (options == null) {
        options = {};
      }
      if (!options.hasOwnProperty("stdio")) {
        options.stdio = "inherit";
      }
      var cwd = process.cwd();
      if (options.hasOwnProperty("cwd")) {
        cwd = path.resolve(cwd, options.cwd);
      }
      grunt.log.ok("executing: " + cmd.cmd + " " + (cmd.args || []).join(" "));
      grunt.log.ok(" >> within '" + cwd + "'");

      var res = childProcess.spawnSync(cmd.cmd, cmd.args, options);
      if (res.error != null && res.status === 0) {
        grunt.log.error(" >> command failed with exit-code [" + res.status + "]");
        grunt.log.error(" >> >> " + res.error.message);
      } else {
        grunt.log.ok(" >> command succeeded");
      }
      return res;
    },

    loadNpmTask(name) {
      if (!grunt.file.exists(path.join(path.resolve("node_modules"), name, "package.json"))) {
        if (dependencies.hasOwnProperty(name)) {
          return grunt.fail.fatal("You need to run 'npm install' first.");
        } else {
          //noinspection JSUnresolvedFunction
          if (optionalDependencies.hasOwnProperty(name)) {
            return grunt.fail.fatal("According to your configuration you need to install '" + name +
                "'. Try 'npm install " + name + "'");
          }
          grunt.log.warn("grunt-task '" + name + "' could not get resolved");
        }
      }
      grunt.loadNpmTasks(name);
    },

    readModule(id) {
      var result = grunt.file.readJSON(path.join(config.cwd, "modules", id + ".json"));
      if (result != null) {
        result.id = id;
      }
      return result;
    },

    findModules() {
      var p = path.join(config.cwd, "modules");
      if (!grunt.file.isDir(p)) {
        return config.modules = [];
      }
      var files = fs.readdirSync(p);
      return config.modules = _.compact(_.map(files, file => {
        if (path.extname(file) === ".json") {
          return helpers.readModule(path.basename(file, ".json"));
        }
      }));
    },

    findModule(alias) {
      var p = path.join(config.cwd, "modules");
      if (!grunt.file.isDir(p)) {
        return;
      }
      var moduleFile = path.join(p, alias + ".json");
      if (grunt.file.exists(moduleFile)) {
        return moduleFile;
      }
      var files = fs.readdirSync(p);
      var file = _.find(files, file => path.extname(file) === ".json" &&
          (~_.indexOf(helpers.readModule(path.basename(file, ".json")).aliases, alias)) &&
          file);
      if (file) {
        return path.join(p, file);
      }
    },

    camelCase(str) {
      return str.replace(/[^a-zA-Z\d]+([a-zA-Z\d])/g, (match, char) => char.toUpperCase());
    },

    idToName(id) {
      return id.replace(/(^|[^a-zA-Z])([a-z])/g, (ignored, bound, letter) => bound + letter.toUpperCase());
    },

    getLicenseText(name) {
      return (config.licenses[name] || "").replace(/\n/g, grunt.util.linefeed);
    },

    getMetaData(moduleId, moduleType, moduleMeta) {
      if (!config.types.hasOwnProperty(moduleType) || config.types[moduleType] == null) {
        return grunt.fail.fatal("Type '" + moduleType + "' not found.");
      }
      var iD = helpers.camelCase(moduleId);
      var Id = iD[0].toUpperCase() + iD.substring(1);
      var ID = iD.replace(/([A-Z])/g, "_$1").toUpperCase();
      var meta = _.extend({id: moduleId, Id, iD, ID}, MODULE_META_STATICS, moduleMeta);
      meta.type = _.extend({id: moduleType}, config.types[moduleType].setup.meta);
      return meta;
    },

    getReplacer(regex, content) {
      return function replaceObj(obj) {
        function replaceMatch(match, name) {
          var recursive = name[0] === ">";
          if (recursive) {
            name = name.substring(1);
          }
          var result = helpers.getByKey(content, name);
          if (_.isUndefined(result)) {
            return match;
          } else if (typeof result === "string" && recursive) {
            return result.replace(regex, replaceMatch);
          }
          return result || "";
        }

        if (obj == null) {
          return obj;
        }
        if (typeof obj === "object") {
          if (obj instanceof Array) {
            return _.map(obj, replaceObj);
          }
          return _.mapValues(obj, replaceObj);
        }
        if (typeof obj === "string") {
          return obj.replace(regex, replaceMatch);
        }
        return obj;
      };
    },

    getCompilation(key, dev) {
      return _.flattenDeep(helpers.populateCompilation(key + (dev ? ".dev" : ".dist")));
    },

    populateCompilation(obj) {
      var type = typeof obj;
      if (type === "string") {
        return helpers.populateCompilation(helpers.getByKey(config.compilation, obj));
      }
      if (type !== "object") {
        return grunt.fail.fatal("Compilation-Config invalid.");
      }
      if (obj instanceof Array) {
        return _.map(obj, helpers.populateCompilation);
      }
      return [obj];
    }

  };

  return helpers;
};