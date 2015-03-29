"use strict";

var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var semver = require("semver");
var regexps = require("regexps");

var prefix = "init.prompt.";

module.exports = function (config, helpers, gruntConfig) {
  var grunt = this, idOverwriteConfirm = null;
  var keywords = config.meta.keywords instanceof Array ? config.meta.keywords : ["nodebb", "@{type}"];

  helpers.loadNpmTask("grunt-prompt");

  var customTypeMetaKeys = _.uniq(_.flatten(_.map(_.pluck(_.values(config.types), "meta"), function (val) {
    return _.keys(val);
  })));

  var replacer = {};

  function addReplacer(value, key) {
    replacer[key] = {
      regex: new RegExp("\\$\\{" + key + "}", "gi"),
      value: value
    };
  }

  _.each(["type.id", "id", "name", "version", "license", "author"], function (key) {
    addReplacer(function (key) {
      return grunt.config(prefix + key);
    }, key);
  });

  gruntConfig.prompt.init = {
    options: {
      questions: [].concat(
          {
            config: prefix + "type.id",
            type: "list",
            message: "Choose the NodeBB module-type:",
            choices: _.map(config.types, function (val, key) {
              return {name: val.name, value: key};
            }).concat("---", {name: "New Module-Type", value: null})
          },
          {
            config: prefix + "customType.id",
            type: "input",
            message: "Insert a new ID for the custom NodeBB module-type:",
            when: function (answers) {
              return answers[prefix + "type.id"] === null;
            }
          },
          _.map(customTypeMetaKeys, function (key) {
            return {
              config: prefix + "customType.meta." + key,
              type: "input",
              message: "Insert the value for '" + key + "' of the new custom module",
              when: function (answers) {
                return answers[prefix + "type.id"] === null && config.types[answers[prefix + "customType.id"]] == null;
              }
            };
          }),
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
      ),
      then: function (answers) {
        function setAnswer(key, val) {
          grunt.config(prefix + key, answers[prefix + key] = val);
          return val;
        }

        var i;
        // handle custom type
        if (answers[prefix + "type.id"] === null) {
          var customTypeId = answers[prefix + "customType.id"];
          if (config.types[customTypeId] == null) {
            var typesPath = path.join(config.cwd, "config", "types.json");
            var typesJSON = grunt.file.readJSON(typesPath);
            var t = typesJSON[customTypeId] = config.types[customTypeId] = {
              name: customTypeId.replace(/(^|[^a-zA-Z])([a-z])/g, function (ignored, bound, letter) {
                return bound + letter.toUpperCase();
              }),
              setup: {
                base: "setups/${type.id}",
                metaReplace: {
                  regex: "\\$\\{([^}]+)}",
                  files: ["LICENSE", "package.json", "README.md", "theme.json", "plugin.json"]
                }
              },
              compilation: _.first(_.keys(config.compilation)),
              meta: {}
            };
            _.each(customTypeMetaKeys, function (key) {
              t.meta[key] = answers[prefix + "customType.meta." + key];
            });
            grunt.file.write(typesPath, JSON.stringify(typesJSON, null, 2));
            grunt.log.ok("Updated '" + path.relative(config.cwd, typesPath) + "' with new type '" + customTypeId + "'");
          }
          setAnswer("type.id", "customType.id");
        }
        _.each(config.types[answers[prefix + "type.id"]].meta, addReplacer);
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
        if (aliases.length > 0) {
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
        var licensesPath = path.join(config.cwd, "config", "licenses.json");
        var licensesJSON = grunt.file.readJSON(licensesPath);
        if (!licensesJSON.hasOwnProperty(license)) {
          licensesJSON[license] = "";
          grunt.file.write(licensesPath, JSON.stringify(licensesJSON, null, 2));
          grunt.log.ok("Add your license-templates into " + path.relative(config.cwd, licensesJSON));
        }
      }
    }
  };

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
    _.each(replacer, function (r, name) {
      obj = obj.replace(r.regex, typeof r.value === "function" ? r.value(name) : r.value);
    });
    return obj;
  }

  grunt.registerTask("initProject", "Creates an initial module as specified by the prompt:init task", function () {
    var id = grunt.config(prefix + "id");
    var name = grunt.config(prefix + "name");
    var type = grunt.config(prefix + "type.id");
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

    // TODO if module-id or dest exists already: start prompt for overwrite-confirmation

    // write module-details
    var moduleFile = path.join(config.cwd, "modules", id + ".json");
    grunt.file.write(moduleFile, JSON.stringify(module, null, 2));
    grunt.log.ok("File '" + path.relative(config.cwd, moduleFile) + "' written.");

    // prepare options of further tasks
    var destination = path.join(config.cwd, replace(config.paths.source.base));
    var srcDir = path.join(config.cwd, replace(config.types[type].setup.base));
    if (!grunt.file.isDir(srcDir)) {
      // No setup specified. Create empty directory.
      grunt.file.mkdir(destination);
      return;
    }
    grunt.config("copy.init.cwd", srcDir);
    grunt.config("copy.init.dest", destination);
    grunt.config("initProjectReplace.options", {
      cwd: destination,
      metaReplace: config.types[module.type].setup.metaReplace,
      meta: _.extend({}, module, config.types[module.type].meta, {
        "type.id": module.type,
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

    var relativeSrc = path.relative(config.cwd, srcDir);
    var relativeDest = path.relative(config.cwd, destination);
    grunt.log.ok("Set-up copy-task 'copy:init': " + relativeSrc + " -> " + relativeDest);

    // copy module-template and replace its values
    grunt.task.run("copy:init", "initProjectReplace");
  });

  grunt.registerTask("initProjectReplace", "Replaces project-variables as specified by the initProject task", function () {
    var options = this.options();
    var metaReplace = helpers.getTextReplacer(new RegExp(options.metaReplace.regex, "g"), options.meta);
    // write LICENSE
    var licenseText = metaReplace(helpers.getLicenseText(options.meta.license));
    if (licenseText) {
      grunt.file.write(path.join(options.cwd, "LICENSE"), licenseText);
    }
    // edit package.json
    var packagePath = path.join(options.cwd, "package.json");
    if (grunt.file.exists(packagePath)) {
      var packageJSON = grunt.file.readJSON(packagePath);
      if (!options.meta.git) {
        delete packageJSON.repository;
      }
      packageJSON.keywords = options.meta.keywords;
      grunt.file.write(packagePath, JSON.stringify(packageJSON, null, 2));
    }
    // write meta-replaces as specified within config/types.json
    _.each(grunt.file.expand({cwd: options.cwd}, options.metaReplace.files), function (filePath) {
      filePath = path.join(options.cwd, filePath);
      if (grunt.file.isFile(filePath)) {
        grunt.file.write(filePath, metaReplace(grunt.file.read(filePath)));
      }
    });
    // write meta-replaces for paths as specified within config/types.json
    _.each(grunt.file.expand({cwd: options.cwd}, options.metaReplace.paths), function (filePath) {
      filePath = path.join(options.cwd, filePath);
      var newFilePath = metaReplace(filePath);
      if (newFilePath !== filePath) {
        fs.renameSync(filePath, newFilePath);
      }
    });

    grunt.log.ok("Your new NodeBB " + options.meta["type.id"] + " '" + options.meta.id + "' has been created.");
    grunt.log.ok("It is placed within " + path.relative(config.cwd, options.cwd));
  });

  grunt.registerTask("init", ["prompt:init", "initProject"]);

  return {};
};
