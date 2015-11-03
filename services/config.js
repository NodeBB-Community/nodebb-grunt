"use strict";

var _ = require("lodash");
var path = require("path");

var _cfg = ["compilation", "licenses", "meta", "paths", "publish", "types"];

module.exports = function (cwd) {
  var grunt = this, config = {};

  for (var i = 0; i < _cfg.length; i++) {
    var filePath = path.join(cwd, "config", _cfg[i] + ".json");
    var filePathLocal = path.join(cwd, "config", _cfg[i] + ".local.json");
    if (grunt.file.exists(filePath)) {
      config[_cfg[i]] = grunt.file.readJSON(filePath);
      if (grunt.file.exists(filePathLocal)) {
        _.merge(config[_cfg[i]], grunt.file.readJSON(filePathLocal));
      }
    } else {
      throw new Error("Config missing: " + _cfg[i]);
    }
  }
  config.pkg = grunt.file.readJSON(path.join(cwd, "package.json"));
  config.cwd = cwd;

  return config;
};
