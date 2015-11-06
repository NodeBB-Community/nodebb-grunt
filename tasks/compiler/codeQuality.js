/*
 * Compiler: codeQuality - Run code-quality checks of supported linters.
 *
 * Each file gets checked with all linters according to their configuration files (using the closest one within the
 * module source directory) if any is found.
 *
 * Supported linters:
 *  + JSHint - .jshintrc
 *  + JSLint - .jslintrc
 *  + TSLint - tslint.json (standard), .tslintrc (non-standard)
 *  + ESLint - .eslintrc
 *  + JSCS - .jscsrc
 *  + Closure Linter - .gjslintrc
 */

"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");

var SUPPORTED_LINTERS = {
  ".jshintrc": {module: "grunt-contrib-jshint", task: "jshint", ext: ".js"},
  ".jslintrc": {module: "grunt-jslint", task: "jslint", ext: ".js"},
  ".jscsrc": {module: "grunt-jscs", task: "jscs", ext: ".js"},
  ".eslintrc": {module: "grunt-eslint", task: "eslint", ext: ".js"},
  ".gjslintrc": {module: "grunt-gjslint", task: "gjslint", ext: ".js"},
  "tslint.json": {module: "grunt-tslint", task: "tslint", ext: ".ts"},
  ".tslintrc": {module: "grunt-tslint", task: "tslint", ext: ".ts"}
};

module.exports = function (config, helpers, gruntConfig) {
  var grunt = this;
  var enabled = [];
  var linters = _.pick(SUPPORTED_LINTERS, function (tool) {
    if (_.contains(enabled, tool.task)) {
      return true;
    }
    if (fs.existsSync(path.join(config.cwd, "node_modules", tool.module))) {
      enabled.push(tool.task);
      gruntConfig[tool.task] = {};
      helpers.loadNpmTask(tool.module);
      return true;
    }
    grunt.log.warn("WARN: Code quality check '" + tool.task + "' is disabled. Install node module '" + tool.module + "' to enable.");
  });

  function mapDirectoryRecursive(options, dir, queue, targets) {
    var files = fs.readdirSync(dir);
    _.each(linters, function (tool, key) {
      var idx = _.indexOf(files, key);
      if (~idx) {
        var file = path.join(dir, files[idx]);
        try {
          var stats = fs.statSync(file);
          if (stats.isFile()) {
            var entry = {configFile: file, options: JSON.parse(fs.readFileSync(file)), tool: tool, files: []};
            targets = _.clone(targets);
            targets[tool.task] = entry;
            files.splice(idx, 1);
            queue.push(entry);
          }
        } catch (e) {}
      }
    });
    _.each(files, function (filename) {
      var file = path.join(dir, filename);
      var stats = fs.statSync(file);
      if (stats.isFile() && (!options.files || grunt.file.match(options, options.files, file))) {
        _.each(targets, function (match) {
          if (filename.endsWith(match.tool.ext)) {
            match.files.push(file);
          }
        });
      } else if (stats.isDirectory() && !_.contains(options.ignoreDirs, filename)) {
        mapDirectoryRecursive(options, file, queue, targets);
      }
    });
  }

  grunt.registerTask("codeQuality_step", function () {
    var active = grunt.config.get("codeQuality");
    var entry = active.stack.pop();
    grunt.config.set("codeQuality", active);
    if (entry.files.length) {
      grunt.log.ok("CodeQuality (" + entry.tool.task + "): Process " + path.relative(active.root, entry.configFile));
      var cfg;
      switch (entry.tool.task) {
        case "tslint":
          cfg = {options: {configuration: entry.options}, files: entry.files};
          break;
        case "jslint":
          cfg = {options: entry.options, src: entry.files};
          break;
        case "eslint":
          cfg = {options: {configFile: entry.configFile}, target: entry.files};
          break;
        case "gjslint":
          cfg = {options: {flags: ["--flagfile " + entry.configFile]}, src: entry.files};
          break;
        default:
          cfg = {options: entry.options, files: {src: entry.files}};
      }
      grunt.config.set(entry.tool.task, cfg);
      grunt.task.run(entry.tool.task);
    }
    if (active.stack.length) {
      grunt.task.run("codeQuality_step");
    }
  });

  return {
    process: function (module, options) {
      if (_.isEmpty(linters)) {
        grunt.log.warn("WARN: For code quality checks you need to install at least one of the supported tasks: " + _.pluck(SUPPORTED_LINTERS, "module").join(" "));
        grunt.log.warn("WARN: skipping.");
        return;
      }
      var queue = [];
      mapDirectoryRecursive(options, module.paths.source, queue, {});

      if (queue.length) {
        grunt.config.set("codeQuality", {stack: queue.reverse(), root: module.paths.source});
        return "codeQuality_step";
      }
    }
  };
};
