"use strict";

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var semver = require("semver");
var regexps = require("regexps");

var prefix = "init.prompt.";

module.exports = function (config, helpers, gruntConfig) {
  var grunt = this;
  var idOverwriteConfirm = null;
  var keywords = config.meta.keywords instanceof Array ? config.meta.keywords : ["nodebb", "@{type.name}"];
  var metaService = helpers.loadService("meta");

  helpers.loadNpmTask("grunt-prompt");

  /*============================================== Question Definitions ==============================================*/

  var customTypeMetaKeys = _.uniq(_.flatten(_.map(_.pluck(_.values(config.types), "meta"), val => _.keys(val))));

  var questions = {
    type: [
      {
        config: prefix + "type.id", type: "list", message: "Choose the NodeBB module-type:",
        choices: _.map(_.sortBy(_.compact(_.map(config.types, (t, k) => t && {key: k, sort: t.sort, name: t.name})), "sort"), t => ({
          name: t.name,
          value: t.key
        })).concat("---", {name: "New Module-Type", value: null})
      },
      {
        config: prefix + "customType.id", type: "input", message: "Insert a new ID for the custom NodeBB module-type:",
        when(answers) {
          return answers[prefix + "type.id"] === null;
        }
      }
    ].concat(_.map(customTypeMetaKeys, key => ({
      config: prefix + "customType.meta." + key,
      type: "input",
      message: "Insert the value for '" + key + "' of the new custom module:",

      when(answers) {
        return answers[prefix + "type.id"] === null && config.types[answers[prefix + "customType.id"]] == null;
      }
    }))),

    id: [{
      config: prefix + "id", type: "input",
      message: "Specify the ID of your new module (without nodebb-[type]- prefix):",
      validate(id) {
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
        when(answers) {
          return answers[prefix + "license"] === "Others";
        }
      },
      {
        config: prefix + "author",
        type: "input",
        message: "Author:",
        default: metaService.authorObjectToString(config.meta.author),
        validate(str) {
          return metaService.authorStringToObject(str) == null ? "An author needs at least a name." : true;
        },
        filter(str) {
          var obj = metaService.authorStringToObject(str);
          obj.full = str;
          return obj;
        }
      }
    ],

    keywords: {
      config: prefix + "keywords", type: "input", message: "Keywords to associate with the module (comma-separated):",
      default: keywords.join(", ")
    },

    git: [{
      config: prefix + "git.provider", type: "list",
      message: "Choose the git-provider to use for the package.json entry:",
      choices: _.map(config.git.providers, (url, name) => ({
        name
      })).concat("---", {name: "None", value: "$$none"}),
      default: config.git.defaultProvider || "$$none"
    }],

    aliases: [{config: prefix + "aliases", type: "input", message: "Module-aliases for grunt tasks (comma-separated):"}]
  };

  var questionsArray = [].concat(questions.type, questions.id, questions.meta, questions.license, questions.keywords,
                                 questions.git, questions.aliases);

  /*-------------------------------------------- Question post-processing --------------------------------------------*/

  function processTypeId(answers, setAnswer) {
    if (answers[prefix + "type.id"] === null) {
      var customTypeId = answers[prefix + "customType.id"];
      if (config.types[customTypeId] == null) {
        var typePath = path.join(config.cwd, "config/types", helpers.camelCase(customTypeId) + ".local.json");
        var typeJSON;
        if (grunt.file.exists(typePath)) {
          typeJSON = grunt.file.readJSON(typePath);
        } else {
          typeJSON = {};
        }
        var t = typeJSON[customTypeId] = config.types[customTypeId] = {
          name: helpers.idToName(customTypeId),
          sort: 2000,
          compilation: _.first(_.keys(config.compilation)),
          setup: {
            base: "setups/${type.id}",
            metaReplace: {
              regex: "\\$\\{([^}]+)}",
              files: ["LICENSE", "README.md", "package.json", "theme.json", "plugin.json"],
              paths: ["**/*"]
            },
            meta: {}
          }
        };
        _.each(customTypeMetaKeys, key => {
          t.setup.meta[key] = answers[prefix + "customType.meta." + key];
        });
        grunt.file.write(typePath, JSON.stringify(typeJSON, null, 2));
        grunt.log.ok("Updated '" + path.relative(config.cwd, typePath) + "' with new type '" + customTypeId + "'");
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
      setAnswer("git.url", config.git.providers[answers[prefix + "git.provider"]]);
    }
  }

  function processLicense(answers) {
    var license = answers[prefix + "license"];
    var configDir = path.join(config.cwd, "config");
    var localLicensesPath = path.join(configDir, "licenses.json");
    var licensesJSON = grunt.file.readJSON(path.join(configDir, "licenses.json"));
    var localLicensesJSON = {};
    if (grunt.file.exists(localLicensesPath)) {
      localLicensesJSON = grunt.file.readJSON(localLicensesPath);
    }
    if (!licensesJSON.hasOwnProperty(license) && !localLicensesJSON.hasOwnProperty(license)) {
      localLicensesJSON[license] = "";
      grunt.file.write(localLicensesPath, JSON.stringify(localLicensesJSON, null, 2));
      grunt.log.ok("Add your license-templates into " + path.relative(config.cwd, localLicensesPath));
    }
  }

  /*============================================== Task Specifications  ==============================================*/

  /*-------------------------------------------------- Prompt Task  --------------------------------------------------*/

  gruntConfig.prompt.init = {
    options: {
      questions: questionsArray,
      then(answers) {
        var setAnswer = (key, val) => {
          grunt.config.set(prefix + key, answers[prefix + key] = val);
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

  grunt.registerTask("initProject", "Creates an initial module as specified by the prompt:init task", () => {
    var typeId = grunt.config(prefix + "type.id");
    var type = config.types[typeId];

    var module = {
      type: typeId,
      publish: {source: true, distribution: true}
    };
    var moduleMeta = {build: 0};

    var meta = _.extend({}, config.meta, helpers.getMetaData(grunt.config(prefix + "id"), module.type, moduleMeta), {
      name: grunt.config(prefix + "name"),
      author: grunt.config(prefix + "author"),
      license: {id: grunt.config(prefix + "license")},
      description: grunt.config(prefix + "description")
    });

    var metaReplaceData = type.setup.metaReplace;
    var metaReplace = helpers.getReplacer(new RegExp(metaReplaceData.regex, "g"), meta);

    meta.license.text = metaReplace(helpers.getLicenseText(meta.license.id));
    meta.git = metaReplace(grunt.config(prefix + "git.url"));
    meta.keywords = metaReplace(grunt.config(prefix + "keywords"));
    meta.aliases = module.aliases = metaReplace(grunt.config(prefix + "aliases"));

    var moduleFile = path.join(config.cwd, "modules", meta.id + ".json");
    var destination = path.join(config.cwd, metaReplace(config.paths.source.base));
    var source = path.join(config.cwd, metaReplace(type.setup.base));
    var relDestination = path.relative(config.cwd, destination);

    if (!grunt.file.exists(moduleFile) && grunt.file.exists(destination)) {
      grunt.log.ok("The module-destination '" + relDestination + "' exists already. Overwriting.");
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

    grunt.config.set("copy.init", {
      files: [{
        expand: true,
        dot: true,
        cwd: source,
        src: "**/*",
        dest: destination
      }]
    });
    grunt.config.set("initProjectReplace.options", {
      cwd: destination,
      meta,
      moduleMeta,
      metaReplace,
      metaReplaceData
    });

    grunt.log.ok("Set-up copy-task 'copy:init': " + path.relative(config.cwd, source) + " -> " + relDestination);
    grunt.task.run(["copy:init", "initProjectReplace"]);
  });

  /*---------------------------- Run static replace-meta task for module pre-compilation  ----------------------------*/

  grunt.registerTask("initProjectReplace", "Replaces project-variables as specified by the initProject task", function () {
    var options = this.options();
    var meta = options.meta;
    var metaReplace = options.metaReplace;
    var moduleMeta = options.moduleMeta;
    var moduleMetaFile = path.join(options.cwd, ".meta.json");
    // edit .meta.json
    if (grunt.file.exists(moduleMetaFile)) {
      moduleMeta = _.merge(grunt.file.readJSON(moduleMetaFile), moduleMeta);
    }
    grunt.file.write(moduleMetaFile, JSON.stringify(moduleMeta, null, 2));
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
    _.each(grunt.file.expand({cwd: options.cwd}, options.metaReplaceData.files), filePath => {
      filePath = path.join(options.cwd, filePath);
      if (grunt.file.isFile(filePath)) {
        grunt.file.write(filePath, metaReplace(grunt.file.read(filePath)));
      }
    });
    // write meta-replaces for paths as specified within config/types.json
    _.each(grunt.file.expand({cwd: options.cwd}, options.metaReplaceData.paths), filePath => {
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

  grunt.registerTask("init", ["prompt:init", "initProject"]);
  return {};
};
