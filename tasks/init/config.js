"use strict";

var path = require("path");

var prefix = "config.prompt.";

module.exports = function (config, helpers, gruntConfig) {
  var grunt = this, nameOverwriteConfirm = null;
  var ghName = /github\.com\/([^\/]+)\//.exec(config.publish.git.providers && config.publish.git.providers.GitHub);
  ghName = ghName ? ghName[1] : "";

  helpers.loadNpmTask("grunt-prompt");

  gruntConfig.prompt.config = {
    options: {
      questions: [
        {
          config: prefix + "author",
          type: "input",
          message: "Specify the default author-value:",
          default: config.meta.author
        },
        {
          config: prefix + "github.use",
          type: "confirm",
          message: "Do you use GitHub?",
          default: config.publish.git.defaultProvider === "GitHub"
        },
        {
          config: prefix + "github.name",
          type: "input",
          message: "Specify your GitHub username:",
          default: ghName,
          when: function (answers) {
            return answers[prefix + "github.use"] === true;
          }
        },
        {
          config: prefix + "repository.url",
          type: "input",
          message: "Insert the git-repository URL schema of your providers public-access URLs." + grunt.util.linefeed +
          "  You may use the placeholders @{type} (e.g. 'plugin') and @{id} (e.g. 'my-plugin')." + grunt.util.linefeed +
          "  Sample: https://github.com/frissdiegurke/nodebb-@{type}-@{id}.git" + grunt.util.linefeed +
          "  Keep empty if you don't want it to be set within package.json of your modules." + grunt.util.linefeed,
          when: function (answers) {
            return answers[prefix + "github.use"] === false;
          },
          filter: function (str) {
            return str.trim() || null;
          }
        },
        {
          config: prefix + "repository.providerName",
          type: "input",
          message: "Insert any id for the git-URL schema specified above:",
          when: function (answers) {
            return typeof answers[prefix + "repository.url"] === "string";
          },
          validate: function (str) {
            if (str === "$$none") {
              return "Reserved Keyword";
            }
            if (config.git.providers[str] != null) {
              if (nameOverwriteConfirm === str) {
                return true;
              } else {
                //noinspection JSUnusedAssignment
                nameOverwriteConfirm = str;
                return "Provider '" + str + "' already exists. Repeat to force overwrite.";
              }
            }
            nameOverwriteConfirm = null;
            return str.length >= 0 ? true : "You need to specify a new ID";
          }
        },
        {
          config: prefix + "paths.deploy",
          type: "input",
          message: "Specify the path to deploy the modules, e.g. node_modules/ within your NodeBB root:",
          default: config.paths.deploy,
          validate: function (dir) {
            if (!dir.trim().length) {
              return true;
            }
            return grunt.file.isDir(path.join(config.cwd, dir)) ? true : "The given path is no directory.";
          }
        }
      ],
      then: function (answers) {
        var metaFile = path.join(config.cwd, "config", "meta.json");
        var pathsFile = path.join(config.cwd, "config", "paths.json");
        var publishFile = path.join(config.cwd, "config", "publish.json");
        var meta = grunt.file.readJSON(metaFile);
        var paths = grunt.file.readJSON(pathsFile);
        var publish = grunt.file.readJSON(publishFile);
        // add meta-info
        meta.author = answers[prefix + "author"];
        // add publish-info
        if (publish.git.providers == null) {
          publish.git.providers = {};
        }
        if (answers[prefix + "github.use"]) {
          publish.git.providers.GitHub = "https://github.com/" + answers[prefix + "github.name"] + "/nodebb-@{type}-@{id}.git";
          publish.git.defaultProvider = "GitHub";
        } else if (answers[prefix + "repository.url"] != null) {
          var providerName = answers[prefix + "repository.providerName"];
          publish.git.providers[providerName] = answers[prefix + "repository.url"];
          publish.git.defaultProvider = providerName;
        } else {
          delete publish.git.defaultProvider;
        }
        // add paths-info
        paths.deploy = answers[prefix + "paths.deploy"].trim() || "node_modules/";
        grunt.file.write(metaFile, JSON.stringify(meta, null, 2));
        grunt.file.write(pathsFile, JSON.stringify(paths, null, 2));
        grunt.file.write(publishFile, JSON.stringify(publish, null, 2));
      }
    }
  };

  grunt.registerTask("config", ["prompt:config"]);
};
