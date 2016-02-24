"use strict";

var adminPages = require("./adminPages");
var socketRoutes = require("./socketRoutes");

/*
 * This file is supposed to link hooks with functions to be executed.
 */

exports.adminMenu = adminPages.addNavigation;

exports.init = function (data, cb) {
  socketRoutes.init();
  adminPages.onInit(data, cb);
};
