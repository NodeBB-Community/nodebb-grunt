"use strict";

var path = require("path");

/*
 * Compiler: less - Compile LESS files.
 *
 * All options get passed to the grunt-contrib-less task.
 *
 * Additionally the options.paths value gets added the public/less/ and public/vendor/ directories within your NodeBB
 * root, so you can import its files.
 *
 * See https://github.com/gruntjs/grunt-contrib-less for more details.
 */

module.exports = function (config, helpers, gruntConfig) {
  var grunt = this;
  helpers.loadNpmTask("grunt-contrib-less");

  gruntConfig.less = {};
  var nbbRoot = path.join(config.cwd, config.paths.nodeBB.root);

  var pathsToAdd = [
    path.join(nbbRoot, "public/less"),
    path.join(nbbRoot, "public/vendor")
  ];

  return {
    process(module, options) {
      if (options.options == null) { options.options = {}; }

      var optPaths = options.options.paths;
      if (typeof optPaths === "string") { optPaths = [optPaths]; }
      if (!(optPaths instanceof Array)) { optPaths = ["."]; }
      options.options.paths = optPaths.concat(pathsToAdd);

      grunt.config.set("less.step", options);
      return "less:step";
    }
  };
};
