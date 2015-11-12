"use strict";

var path = require("path");

var prefix = "config.prompt.";

module.exports = function (config, helpers, gruntConfig) {
  var grunt = this, nameOverwriteConfirm = null;
  var metaService = helpers.loadService("meta");

  helpers.loadNpmTask("grunt-prompt");

  gruntConfig.prompt.config = {
    options: {
      questions: [
        {
          config: prefix + "author",
          type: "input",
          message: "Specify the default author-value:",
          default: metaService.authorObjectToString(config.meta.author),
          validate: function (str) {
            return metaService.authorStringToObject(str) == null ? "An author needs at least a name." : true;
          },
          filter: function (str) {
            return metaService.authorStringToObject(str);
          }
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
          default: config.meta.GitHubAuthor,
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
          config: prefix + "paths.nodeBB.root",
          type: "input",
          message: "Specify the path to your NodeBB root:",
          default: config.paths.nodeBB.root
        },
        {
          config: prefix + "paths.nodeBB.deploy",
          type: "input",
          message: "Specify the path to deploy the modules to (relative to NodeBB root):",
          default: config.paths.nodeBB.deploy
        }
      ],
      then: function (answers) {
        var configDir = path.join(config.cwd, "config");
        var meta = grunt.file.readJSON(path.join(configDir, "meta.json"));
        var paths = grunt.file.readJSON(path.join(configDir, "paths.json"));
        var git = grunt.file.readJSON(path.join(configDir, "git.json"));
        // add meta-info
        meta.author = answers[prefix + "author"];
        // add git-info
        if (git.providers == null) {
          git.providers = {};
        }
        if (answers[prefix + "github.use"]) {
          meta.GitHubAuthor = answers[prefix + "github.name"];
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
        paths.nodeBB = {
          root: answers[prefix + "paths.nodeBB.root"].trim(),
          deploy: answers[prefix + "paths.nodeBB.deploy"].trim()
        };
        grunt.file.write(path.join(configDir, "meta.local.json"), JSON.stringify(meta, null, 2));
        grunt.file.write(path.join(configDir, "paths.local.json"), JSON.stringify(paths, null, 2));
        grunt.file.write(path.join(configDir, "git.local.json"), JSON.stringify(git, null, 2));
      }
    }
  };

  grunt.registerTask("config", ["prompt:config"]);
};
