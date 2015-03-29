"use strict";

module.exports = function (config, helpers) {
  helpers.loadNpmTask("grunt-contrib-copy");

  return { // cwd and dest get set by prompt:init task
    expand: true,
    src: "**/*"
  };
};