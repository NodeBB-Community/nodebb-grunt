"use strict";

var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var semver = require("semver");
var regexps = require("regexps");

var prefix = "init.prompt.";

module.exports = function (config, helpers, gruntConfig) {
  var grunt = this, idOverwriteConfirm = null;
  var keywords = config.meta.keywords instanceof Array ? config.meta.keywords : ["nodebb", "@{type.name}"];

  helpers.loadNpmTask("grunt-prompt");

  /*============================================== Question Definitions ==============================================*/

  var customTypeMetaKeys = _.uniq(_.flatten(_.map(_.pluck(_.values(config.types), "meta"), function (val) {
    return _.keys(val);
  })));

  var questions = {
    type: [
      {
        config: prefix + "type.id", type: "list", message: "Choose the NodeBB module-type:",
        choices: _.map(config.types, function (val, key) {
          return {name: val.name, value: key};
        }).concat("---", {name: "New Module-Type", value: null})
      },
      {
        config: prefix + "customType.id", type: "input", message: "Insert a new ID for the custom NodeBB module-type:",
        when: function (answers) {
          return answers[prefix + "type.id"] === null;
        }
      }
    ].concat(_.map(customTypeMetaKeys, function (key) {
          return {
            config: prefix + "customType.meta." + key, type: "input",
            message: "Insert the value for '" + key + "' of the new custom module:",
            when: function (answers) {
              return answers[prefix + "type.id"] === null && config.types[answers[prefix + "customType.id"]] == null;
            }
          };
        })),

    id: [{
      config: prefix + "id", type: "input",
      message: "Specify the ID of your new module (without nodebb-[type]- prefix):",
      validate: function (id) {
        if (!id) {
          idOverwriteConfirm = null;
          return "No ID specified.";
        }
        if (idOverwriteConfirm !== id) {
          if (grunt.file.exists(path.join(config.cwd, "modules", id + ".json"))) {
            idOverwriteConfirm = id;
            return "A module with this ID already exists. Enter same again to overwrite.";
          }
          if (id.length < 3 && idOverwriteConfirm !== id) {
            //noinspection JSUnusedAssignment
            idOverwriteConfirm = id;
            return "Please use an ID longer than 3 characters. Enter same again to force.";
          }
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
    }],

    meta: [
      {
        config: prefix + "version", type: "input", message: "Initial version:", default: "0.0.1",
        validate: function (version) {
          if (!semver.valid(version)) {
            return "Version needs to be semver-valid.";
          }
          return true;
        }
      },
      {config: prefix + "name", type: "input", message: "Specify the name of your new module (human readable):"},
      {config: prefix + "description", type: "input", message: "Enter a brief description of what the module does:"}
    ],

    license: [
      {
        config: prefix + "license", type: "list", message: "Choose the license to use:",
        choices: Object.keys(config.licenses).concat("Others")
      },
      {
        config: prefix + "license", type: "input", message: "License-Name:",
        when: function (answers) {
          return answers[prefix + "license"] === "Others";
        }
      },
      {config: prefix + "author", type: "input", message: "Author:", default: config.meta.author}
    ],

    publish: [
      {
        config: prefix + "publish.npm", type: "confirm",
        message: "Enable npm-publish (trigger a npm publish within deploy-dir while grunt publish):", default: true
      },
      {
        config: prefix + "publish.git", type: "confirm",
        message: "Enable git-push (trigger a push within module-dir while grunt publish):", default: true
      }
    ],

    keywords: {
      config: prefix + "keywords", type: "input", message: "Keywords to associate with the module (comma-separated):",
      default: keywords.join(", ")
    },

    git: [{
      config: prefix + "git.provider", type: "list",
      message: "Choose the git-provider to use for the package.json entry:",
      choices: _.map(config.publish.git.providers, function (url, name) {
        return {name: name};
      }).concat("---", {name: "None", value: "$$none"}),
      default: config.publish.git.defaultProvider || "$$none"
    }],

    aliases: [{config: prefix + "aliases", type: "input", message: "Module-aliases for grunt tasks (comma-separated):"}]
  };

  var questionsArray = [].concat(questions.type, questions.id, questions.meta, questions.license, questions.publish,
      questions.keywords, questions.git, questions.aliases);

  /*-------------------------------------------- Question post-processing --------------------------------------------*/

  function processTypeId(answers, setAnswer) {
    if (answers[prefix + "type.id"] === null) {
      var customTypeId = answers[prefix + "customType.id"];
      if (config.types[customTypeId] == null) {
        var typesPath = path.join(config.cwd, "config", "types.json");
        var typesJSON = grunt.file.readJSON(typesPath);
        var t = typesJSON[customTypeId] = config.types[customTypeId] = {
          name: helpers.idToName(customTypeId),
          setup: {
            base: "setups/${type.id}",
            metaReplace: {
              regex: "\\$\\{([^}]+)}",
              files: ["LICENSE", "README.md", "package.json", "theme.json", "plugin.json"],
              paths: ["**/*"]
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
      setAnswer("type.id", customTypeId);
    }
  }

  function processKeywords(answers, setAnswer) {
    if (typeof answers[prefix + "keywords"] === "string") {
      var keywords = answers[prefix + "keywords"].split(",");
      for (var i = 0; i < keywords.length; i++) {
        keywords[i] = keywords[i].trim().toLowerCase();
      }
      setAnswer("keywords", keywords);
    }
  }

  function processAliases(answers, setAnswer) {
    var aliases = answers[prefix + "aliases"].trim();
    if (aliases.length > 0) {
      aliases = aliases.split(",");
      for (var i = 0; i < aliases.length; i++) {
        aliases[i] = aliases[i].trim().toLowerCase();
      }
    } else {
      aliases = [];
    }
    setAnswer("aliases", aliases);
  }

  function processGit(answers, setAnswer) {
    if (answers[prefix + "git.provider"] === "$$none") {
      setAnswer("git.provider", null);
    } else {
      setAnswer("git.url", config.publish.git.providers[answers[prefix + "git.provider"]]);
    }
  }

  function processLicense(answers) {
    var license = answers[prefix + "license"];
    var licensesPath = path.join(config.cwd, "config", "licenses.json");
    var licensesJSON = grunt.file.readJSON(licensesPath);
    if (!licensesJSON.hasOwnProperty(license)) {
      licensesJSON[license] = "";
      grunt.file.write(licensesPath, JSON.stringify(licensesJSON, null, 2));
      grunt.log.ok("Add your license-templates into " + path.relative(config.cwd, licensesJSON));
    }
  }

  /*============================================== Task Specifications  ==============================================*/

  /*-------------------------------------------------- Prompt Task  --------------------------------------------------*/

  gruntConfig.prompt.init = {
    options: {
      questions: questionsArray,
      then: function (answers) {
        var setAnswer = function (key, val) {
          grunt.config(prefix + key, answers[prefix + key] = val);
          return val;
        };
        processTypeId(answers, setAnswer);
        processKeywords(answers, setAnswer);
        processAliases(answers, setAnswer);
        processGit(answers, setAnswer);
        processLicense(answers, setAnswer);
      }
    }
  };

  /*----------------------------------- Collect information and create module-file -----------------------------------*/

  grunt.registerTask("initProject", "Creates an initial module as specified by the prompt:init task", function () {
    var typeId = grunt.config(prefix + "type.id"), type = config.types[typeId];

    var module = {
      type: typeId,
      license: grunt.config(prefix + "license"),
      publish: {
        npm: grunt.config(prefix + "publish.npm"),
        git: grunt.config(prefix + "publish.git")
      },
      build: 1
    };

    var meta = _.extend(helpers.getMetaData(grunt.config(prefix + "id"), module), {
      name: grunt.config(prefix + "name"),
      author: grunt.config(prefix + "author"),
      version: grunt.config(prefix + "version"),
      description: grunt.config(prefix + "description")
    });

    var metaReplaceData = type.setup.metaReplace,
        metaReplace = helpers.getReplacer(new RegExp(metaReplaceData.regex, "g"), meta);

    meta.git = metaReplace(grunt.config(prefix + "git.url"));
    meta.licenseText = metaReplace(helpers.getLicenseText(meta.license));
    meta.keywords = metaReplace(grunt.config(prefix + "keywords"));
    meta.aliases = module.aliases = metaReplace(grunt.config(prefix + "aliases"));

    var moduleFile = path.join(config.cwd, "modules", meta.id + ".json"),
        destination = path.join(config.cwd, metaReplace(config.paths.source.base)),
        source = path.join(config.cwd, metaReplace(type.setup.base)),
        relDestination = path.relative(config.cwd, destination);

    if (!grunt.file.exists(moduleFile) && grunt.file.exists(destination)) {
      grunt.fail.warn("The module-destination '" + relDestination + "' exists already.");
    }

    // write module-details
    grunt.file.write(moduleFile, JSON.stringify(module, null, 2));
    grunt.log.ok("File '" + path.relative(config.cwd, moduleFile) + "' written.");

    // prepare options of further tasks
    if (!grunt.file.isDir(source)) {
      // No setup specified. Create empty directory.
      grunt.file.mkdir(destination);
      return;
    }

    grunt.config("copy.init.cwd", source);
    grunt.config("copy.init.dest", destination);
    grunt.config("initProjectReplace.options", {
      cwd: destination,
      meta: meta,
      metaReplace: metaReplace,
      metaReplaceData: metaReplaceData
    });

    grunt.log.ok("Set-up copy-task 'copy:init': " + path.relative(config.cwd, source) + " -> " + relDestination);
  });

  /*---------------------------- Run static replace-meta task for module pre-compilation  ----------------------------*/

  grunt.registerTask("initProjectReplace", "Replaces project-variables as specified by the initProject task", function () {
    var options = this.options();
    var meta = options.meta;
    var metaReplace = options.metaReplace;
    // edit package.json
    var packagePath = path.join(options.cwd, "package.json");
    if (grunt.file.exists(packagePath)) {
      var packageJSON = grunt.file.readJSON(packagePath);
      if (!meta.git) {
        delete packageJSON.repository;
      }
      packageJSON.keywords = meta.keywords;
      grunt.file.write(packagePath, JSON.stringify(packageJSON, null, 2));
    }
    // write meta-replaces as specified within config/types.json
    _.each(grunt.file.expand({cwd: options.cwd}, options.metaReplaceData.files), function (filePath) {
      filePath = path.join(options.cwd, filePath);
      if (grunt.file.isFile(filePath)) {
        grunt.file.write(filePath, metaReplace(grunt.file.read(filePath)));
      }
    });
    // write meta-replaces for paths as specified within config/types.json
    _.each(grunt.file.expand({cwd: options.cwd}, options.metaReplaceData.paths), function (filePath) {
      filePath = path.join(options.cwd, filePath);
      var newFilePath = metaReplace(filePath);
      if (newFilePath !== filePath) {
        fs.renameSync(filePath, newFilePath);
      }
    });
    grunt.log.ok("Your new NodeBB " + meta.type.Name + " '" + meta.id + "' has been created.");
    grunt.log.ok("It is placed within " + path.relative(config.cwd, options.cwd));
  });

  /*------------------------------- Define entry-point task for project-initialization -------------------------------*/

  grunt.registerTask("init", ["prompt:init", "initProject", "copy:init", "initProjectReplace"]);
  return {};
};
