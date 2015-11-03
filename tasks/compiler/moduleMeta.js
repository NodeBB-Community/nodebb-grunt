"use strict";

var _ = require("lodash");
var path = require("path");

module.exports.process = function (module, options, helpers) {
  var grunt = this;
  var content;
  var packagePath = path.join(module.paths.tmp, "package.json");
  if (grunt.file.exists(packagePath)) {
    content = _.merge(grunt.file.readJSON(packagePath), module.meta);
  } else {
    content = module.meta;
  }
  var metaReplace = helpers.getReplacer(new RegExp(options.regex, "g"), content);
  var cwd = module.paths.tmp;
  _.each(grunt.file.expand({cwd: cwd}, options.src), function (filePath) {
    filePath = path.join(cwd, filePath);
    if (grunt.file.isFile(filePath)) {
      grunt.file.write(filePath, metaReplace(grunt.file.read(filePath)));
    }
  });
  // TODO replace occurrences within file-names
};
