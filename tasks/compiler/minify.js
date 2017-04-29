/*
 * Compiler: minify - Compress/Minify/Uglify javascript files.
 *
 * All options get passed to the grunt-contrib-uglify task.
 * See https://github.com/gruntjs/grunt-contrib-uglify for more details.
 */

module.exports = function (config, helpers, gruntConfig) {
  "use strict";

  var grunt = this;
  helpers.loadNpmTask("grunt-contrib-uglify");

  gruntConfig.uglify = {};

  return {
    process(module, options) {
      grunt.config.set("uglify.step", options);
      return "uglify:step";
    }
  };
};
