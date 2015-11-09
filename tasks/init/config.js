"use strict";

var path = require("path");

var prefix = "config.prompt.";

module.exports = function (config, helpers, gruntConfig) {
  var grunt = this, nameOverwriteConfirm = null;
  var ghName = /github\.com\/([^\/]+)\//.exec(config.git.providers && config.git.providers.GitHub);
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
          default: config.git.defaultProvider === "GitHub"
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
          "  Sample: https://github.com/frissdiegurke/@{name}.git" + grunt.util.linefeed +
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
          filter: function (str) {
            if (!/\$\{.*}/.test(str)) {
              return path.join(str, "nodebb-${type.name}-${id}");
            }
            return str;
          }
        }
      ],
      then: function (answers) {
        var metaFile = path.join(config.cwd, "config", "meta.json");
        var pathsFile = path.join(config.cwd, "config", "paths.json");
        var gitFile = path.join(config.cwd, "config", "git.json");
        var meta = grunt.file.readJSON(metaFile);
        var paths = grunt.file.readJSON(pathsFile);
        var git = grunt.file.readJSON(gitFile);
        // add meta-info
        meta.author = answers[prefix + "author"];
        // add git-info
        if (git.providers == null) {
          git.providers = {};
        }
        if (answers[prefix + "github.use"]) {
          git.providers.GitHub = "https://github.com/" + answers[prefix + "github.name"] + "/@{name}.git";
          git.defaultProvider = "GitHub";
        } else if (answers[prefix + "repository.url"] != null) {
          var providerName = answers[prefix + "repository.providerName"];
          git.providers[providerName] = answers[prefix + "repository.url"];
          git.defaultProvider = providerName;
        } else {
          delete git.defaultProvider;
        }
        // add paths-info
        paths.deploy = answers[prefix + "paths.deploy"].trim() || "node_modules/";
        grunt.file.write(metaFile, JSON.stringify(meta, null, 2));
        grunt.file.write(pathsFile, JSON.stringify(paths, null, 2));
        grunt.file.write(gitFile, JSON.stringify(git, null, 2));
      }
    }
  };

  grunt.registerTask("config", ["prompt:config"]);
};
