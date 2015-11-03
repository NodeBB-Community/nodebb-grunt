"use strict";

module.exports.process = function (module, options) {
  var grunt = this;
  grunt.config.set("clean.compiler", options);
  return "clean:compiler";
};
