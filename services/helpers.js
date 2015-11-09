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

module.exports = function (config, gruntConfig, loadService) {
  var grunt = this;
  var dependencies = config.pkg.dependencies || {}, optionalDependencies = config.pkg.optionalDependencies || {};

  //noinspection JSUnusedGlobalSymbols
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

    loadDeepTask: function (dir, name, attrName) {
      return helpers.loadTask(path.join(dir, name), attrName || name);
    },

    loadCompiler: function (name, attrName) {
      return helpers.loadTask(path.join("compiler", name), attrName || name + "Compiler");
    },

    exec: function (cmd, options) {
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

    loadNpmTask: function (name) {
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

    findModule: function (alias) {
      var p = path.join(config.cwd, "modules");
      if (!grunt.file.isDir(p)) {
        return;
      }
      var moduleFile = path.join(p, alias + ".json");
      if (grunt.file.exists(moduleFile)) {
        return moduleFile;
      }
      var files = fs.readdirSync(p);
      var file = _.find(files, function (file) {
        return path.extname(file) === ".json" &&
            (~_.indexOf(helpers.readModule(path.basename(file, ".json")).aliases, alias)) &&
            file;
      });
      if (file) {
        return path.join(p, file);
      }
    },

    camelCase: function (str) {
      return str.replace(/[^a-zA-Z\d]+([a-zA-Z\d])/g, function (match, char) {
        return char.toUpperCase();
      });
    },

    idToName: function (id) {
      return id.replace(/(^|[^a-zA-Z])([a-z])/g, function (ignored, bound, letter) {
        return bound + letter.toUpperCase();
      });
    },

    getLicenseText: function (name) {
      return (config.licenses[name] || "").replace(/\n/g, grunt.util.linefeed);
    },

    getMetaData: function (moduleId, data) {
      if (!config.types.hasOwnProperty(data.type)) {
        return grunt.fail.fatal("Type '" + data.type + "' not found.");
      }
      var iD = helpers.camelCase(moduleId),
          Id = iD[0].toUpperCase() + iD.substring(1),
          ID = iD.replace(/([A-Z])/g, "_$1").toUpperCase();
      var meta = _.extend({id: moduleId, Id: Id, iD: iD, ID: ID}, MODULE_META_STATICS, data);
      meta.type = _.extend({id: data.type}, config.types[data.type].setup.meta);
      return meta;
    },

    getReplacer: function (regex, content) {
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

    getCompilation: function (key, dev) {
      return _.flattenDeep(helpers.populateCompilation(key + (dev ? ".dev" : ".dist")));
    },

    populateCompilation: function (obj) {
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