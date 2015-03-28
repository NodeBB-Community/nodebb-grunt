"use strict";

var path = require("path");

var _cfg = ["compilation", "licenses", "meta", "paths", "publish"];

module.exports = function (cwd) {
  var grunt = this, config = {};

  for (var i = 0; i < _cfg.length; i++) {
    var fPath = path.join(cwd, "config", _cfg[i] + ".json");
    if (grunt.file.exists(fPath)) {
      config[_cfg[i]] = grunt.file.readJSON(fPath);
    } else {
      throw new Error("Config missing: " + _cfg[i]);
    }
  }
  config.pkg = grunt.file.readJSON(path.join(cwd, "package.json"));
  config.cwd = cwd;

  return config;
};
