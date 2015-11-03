"use strict";

module.exports = function (config, helpers) {
  var grunt = this;

  helpers.loadNpmTask("grunt-contrib-watch");

  // TODO rename watch-task, create custom watch-task
  // TODO add watcher to compilation step definitions
  return {};
};