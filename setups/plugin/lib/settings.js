"use strict";

var packageJSON = require("../package.json");
var Settings = require.main.require("./src/settings");

/*
 * This file exports a NodeBB Settings Object and a few meta-data of the project.
 *
 * See https://docs.nodebb.org/en/latest/plugins/settings.html for more details on the Settings Object.
 *
 * This file by default gets meta-replaced (thus @{...} gets resolved within the grunt-tasks).
 * It is not recommended to add any more files, rather it is recommended to add additional exports here if needed.
 */

var env = "@{env}", dev = (env === "development");
var defaultSettings = {
  setting1: "Lorem Ipsum",
  custom: true
};

exports = module.exports = new Settings(packageJSON.name, packageJSON.version, defaultSettings, null, dev, false);

exports.id = "@{id}";
exports.Id = "@{Id}";
exports.iD = "@{iD}";
exports.ID = "@{ID}";
exports.dev = dev;
exports.env = env;
exports.pkg = packageJSON;
