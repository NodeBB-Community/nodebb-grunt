module.exports.process = function (module, options) {
  "use strict";

  var grunt = this;
  grunt.config.set("clean.compiler", options);

  return "clean:compiler";
};
