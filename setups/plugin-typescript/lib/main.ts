"use strict";

var settings = require("./settings");
var adminPages = require("./adminPages");

exports.adminMenu = adminPages.addNavigation;

exports.init = function (data, cb) {
  adminPages.onInit(data, cb);
};

exports.activation = function (id) {
  if (id === settings.pkg.name) {
    settings.setOnEmpty();
  }
};
