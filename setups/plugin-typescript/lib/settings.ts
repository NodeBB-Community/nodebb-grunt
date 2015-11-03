"use strict";

var packageJSON = require('../package.json');
var Settings = require.main.require('./src/settings');

var dev = "@{env}" === "development";
var defaultSettings = {
  setting1: "Hello World!",
  custom: true
};

exports = module.exports = new Settings(packageJSON.name, packageJSON.version, defaultSettings, null, dev, false);

exports.id = "@{id}";
exports.Id = "@{Id}";
exports.iD = "@{iD}";
exports.ID = "@{ID}";
exports.dev = dev;
exports.pkg = packageJSON;
