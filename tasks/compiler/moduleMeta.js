"use strict";

var _ = require("lodash");
var fs = require("fs");
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
  // replace meta within files
  _.each(grunt.file.expand({cwd: cwd}, options.src), function (filePath) {
    filePath = path.join(cwd, filePath);
    if (grunt.file.isFile(filePath)) {
      grunt.file.write(filePath, metaReplace(grunt.file.read(filePath)));
    }
  });
  // move files if path contains meta
  var replaced = [];
  _.each(grunt.file.expand({cwd: cwd}, options.src), function (filePath) {
    filePath = path.join(cwd, filePath);
    _.each(replaced, function (r) { filePath = filePath.replace(r.origin, r.result); });
    var newFilePath = metaReplace(filePath);
    if (newFilePath !== filePath) {
      fs.renameSync(filePath, newFilePath);
      replaced.push({origin: filePath, result: newFilePath});
    }
  });
};
