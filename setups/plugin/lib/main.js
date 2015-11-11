"use strict";

var settings = require("./settings");
var adminPages = require("./adminPages");
var activate = require("./activate");
var socketRoutes = require("./socketRoutes");

/*
 * This file is supposed to link hooks with functions to be executed.
 */

exports.adminMenu = adminPages.addNavigation;

exports.init = function (data, cb) {
  socketRoutes.init();
  adminPages.onInit(data, cb);
};

exports.activation = function (id) { if (id === settings.pkg.name) { activate(); } };
