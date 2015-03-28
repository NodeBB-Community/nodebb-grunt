"use strict";

var _ = require("underscore");
var path = require("path");
var semver = require("semver");
var regexps = require("regexps");

var prefix = "init.prompt.";

module.exports = function (config, helpers, gruntConfig) {
  var grunt = this, idOverwriteConfirm = null;
  var keywords = config.meta.keywords instanceof Array ? config.meta.keywords : ["nodebb", "@{type}"];

  helpers.loadNpmTask("grunt-prompt");

  gruntConfig.prompt.init = {
    options: {
      questions: [
        {
          config: prefix + "type",
          type: "list",
          message: "Choose the NodeBB module-type:",
          choices: _.clone(config.moduleTypes).concat("---", {name: "custom", value: null})
        },
        {
          config: prefix + "type",
          type: "input",
          message: "Specify the custom NodeBB module-type:",
          filter: function (str) {
            return str.trim().toLowerCase();
          },
          when: function (answers) {
            return answers[prefix + "type"] === null;
          }
        },
        {
          config: prefix + "id",
          type: "input",
          message: "Specify the ID of your new module (without nodebb-[type]- prefix):",
          validate: function (id) {
            if (!id) {
              idOverwriteConfirm = null;
              return "No ID specified.";
            }
            if (id.length < 3 && idOverwriteConfirm !== id) {
              //noinspection JSUnusedAssignment
              idOverwriteConfirm = id;
              return "Please use an ID longer than 3 characters. Enter same again to force.";
            }
            idOverwriteConfirm = null;
            if (!/^[^\._]/.test(id)) {
              return "ID may not begin with '.' or '_'.";
            }
            if (!regexps.urlsafe.test(id)) {
              return "ID contains illegal character(s).";
            }
            return true;
          }
        },
        {
          config: prefix + "version",
          type: "input",
          message: "Initial version:",
          default: "0.0.1",
          validate: function (version) {
            if (!semver.valid(version)) {
              return "Version needs to be semver-valid.";
            }
            return true;
          }
        },
        {
          config: prefix + "name",
          type: "input",
          message: "Specify the name of your new module (human readable):"
        },
        {
          config: prefix + "description",
          type: "input",
          message: "Enter a brief description of what the module does:"
        },
        {
          config: prefix + "license",
          type: "list",
          message: "Choose the license to use:",
          choices: Object.keys(config.licenses).concat("Others")
        },
        {
          config: prefix + "license",
          type: "input",
          message: "License-Name:",
          when: function (answers) {
            return answers[prefix + "license"] === "Others";
          }
        },
        {
          config: prefix + "author",
          type: "input",
          message: "Author:",
          default: config.meta.author
        },
        {
          config: prefix + "publish.npm",
          type: "confirm",
          message: "Enable npm-publish (trigger a npm publish within deploy-dir while grunt publ):",
          default: true
        },
        {
          config: prefix + "publish.git",
          type: "confirm",
          message: "Enable git-push (trigger a push within module-dir while grunt publ):",
          default: true
        },
        {
          config: prefix + "keywords",
          type: "input",
          message: "Keywords to associate with the module (comma-separated):",
          default: keywords.join(", ")
        },
        {
          config: prefix + "git.provider",
          type: "list",
          message: "Choose the git-provider to use for the package.json entry:",
          choices: _.map(config.publish.git.providers, function (url, name) {
            return {name: name};
          }).concat("---", {name: "None", value: "$$none"}),
          default: config.publish.git.defaultProvider || "$$none"
        },
        {
          config: prefix + "aliases",
          type: "input",
          message: "Module-aliases for grunt tasks (comma-separated):"
        }
      ],
      then: function (answers) {
        function setAnswer(key, val) {
          grunt.config(prefix + key, answers[prefix + key] = val);
          return val;
        }
        var i;
        // split keywords
        if (typeof answers[prefix + "keywords"] === "string") {
          var keywords = answers[prefix + "keywords"].split(",");
          for (i = 0; i < keywords.length; i++) {
            keywords[i] = keywords[i].trim().toLowerCase();
          }
          setAnswer("keywords", keywords);
        }
        // split aliases
        var aliases = answers[prefix + "aliases"].trim();
        if (aliases.length >= 0) {
          aliases = aliases.split(",");
          for (i = 0; i < aliases.length; i++) {
            aliases[i] = aliases[i].trim().toLowerCase();
          }
        } else {
          aliases = [];
        }
        setAnswer("aliases", aliases);
        // resolve git-url
        if (answers[prefix + "git.provider"] === "$$none") {
          setAnswer("git.provider", null);
        } else {
          setAnswer("git.url", config.publish.git.providers[answers[prefix + "git.provider"]]);
        }
        // add license-attribute to licenses.json if not found therefor the use may add the value later
        var license = answers[prefix + "license"];
        var fPath = path.join(config.cwd, "config", "licenses.json");
        var licenses = grunt.file.readJSON(fPath);
        if (!licenses.hasOwnProperty(license)) {
          licenses[license] = "";
          grunt.file.write(fPath, JSON.stringify(licenses, null, 2));
        }
      }
    }
  };

  var replacer = {};
  _.each(["type", "id", "name", "version", "license", "author"], function (repl) {
    replacer[repl] = new RegExp("\\$\\{" + repl + "\\}", "gi");
  });

  function replace(obj) {
    if (obj == null) {
      return obj;
    }
    if (obj instanceof Array) {
      return obj.map(replace);
    }
    if (typeof obj !== "string") {
      return _.mapObject(obj, replace);
    }
    _.each(replacer, function (name, regex) {
      obj = obj.replace(regex, grunt.config(prefix + "" + name));
    });
    return obj;
  }

  grunt.registerTask("initProject", "Creates an initial module as specified by the prompt:init task", function () {
    var id = grunt.config(prefix + "id");
    var name = grunt.config(prefix + "name");
    var type = grunt.config(prefix + "type");
    var keywords = replace(grunt.config(prefix + "keywords"));
    var git = replace(grunt.config(prefix + "git.url"));
    var module = {
      type: type,
      license: grunt.config(prefix + "license"),
      publish: {
        npm: grunt.config(prefix + "publish.npm"),
        git: grunt.config(prefix + "publish.git")
      },
      aliases: replace(grunt.config(prefix + "aliases"))
    };

    // write module-details
    grunt.file.write(path.join(config.cwd, "modules", id + ".json"), JSON.stringify(module, null, 2));

    // prepare options of further tasks
    var dest = path.join(config.cwd, replace(config.paths.source.base));
    var srcDir = path.join(config.cwd, "initials", type);
    if (!grunt.file.isDir(srcDir)) {
      srcDir = path.join(config.cwd, "initials", "plugin");
    }
    grunt.config("copy.init.files", [
      {
        cwd: srcDir,
        expand: true,
        src: "**/*",
        dest: dest
      }
    ]);
    grunt.config("initProjectReplace.options", {
      cwd: dest,
      meta: _.extend(module, {
        id: id,
        YYYY: new Date().getFullYear(),
        name: name,
        author: grunt.config(prefix + "author"),
        version: grunt.config(prefix + "version"),
        description: grunt.config(prefix + "description"),
        keywords: keywords,
        git: git
      })
    });
    // copy module-template and replace its values
    grunt.task.run(/*"copy:init", */"initProjectReplace");
  });

  grunt.registerTask("initProjectReplace", "Replaces project-variables as specified by the initProject task", function () {
    var options = this.options();
    var meta = options.meta;
    _.each(["theme.json", "plugin.json", "package.json"], function (file, idx) {
      if (grunt.file.exists(file = path.join(options.cwd, file))) {
        var contentJSON = grunt.file.readJSON(file);
        if (!meta.git) {
          delete contentJSON.repository;
        }
        if (idx === 2) {
          // package.json
          contentJSON.keywords = meta.keywords;
        }
        var contentString = JSON.stringify(contentJSON, null, 2);
        grunt.file.write(file, contentString.replace(/\$\{([^}]+)}/g, function (match, name) {
          //noinspection JSUnresolvedFunction
          if (meta.hasOwnProperty(name)) {
            return meta[name] || "";
          }
          return match;
        }));
      }
    });
  });

  grunt.registerTask("init", ["prompt:init", "initProject"]);

  return {};
};
