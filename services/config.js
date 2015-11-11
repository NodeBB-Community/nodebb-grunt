"use strict";

var _ = require("lodash");
var path = require("path");

var _cfg = ["compilation", "types", "git", "licenses", "meta", "paths", "publish"];

module.exports = function (cwd) {
  var grunt = this, config = {}, current;

  var mergeFile = function (file) { current = _.merge(current, grunt.file.readJSON(file)); };

  for (var i = 0; i < _cfg.length; i++) {
    current = null;
    var dirPath = path.join(cwd, "config", _cfg[i]);
    var filePath = path.join(cwd, "config", _cfg[i] + ".json");
    var filePathLocal = path.join(cwd, "config", _cfg[i] + ".local.json");
    if (grunt.file.exists(filePath)) {
      current = grunt.file.readJSON(filePath);
    }
    if (grunt.file.exists(dirPath)) {
      if (current == null) {
        current = {};
      }
      _.each(grunt.file.expand([path.join(dirPath, "**/*.json"), "!**/*.local.json"]), mergeFile);
      _.each(grunt.file.expand([path.join(dirPath, "**/*.local.json")]), mergeFile);
    }
    if (grunt.file.exists(filePathLocal)) {
      if (current == null) {
        current = {};
      }
      current = _.merge(current, grunt.file.readJSON(filePathLocal));
    }
    if (current == null) {
      throw new Error("Config missing: " + _cfg[i]);
    }
    config[_cfg[i]] = current;
  }
  config.pkg = grunt.file.readJSON(path.join(cwd, "package.json"));
  config.cwd = cwd;

  return config;
};
