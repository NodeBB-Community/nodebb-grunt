"use strict";

var settings = require("./settings");

/*
 * This file defines socket routes for data-transmission to the client-side.
 */

//function initUserSockets(Socket) {
//  Socket[settings.iD] = function (socket, data, cb) {
//    cb(null, {dev: settings.dev, version: settings.pkg.version, settings: settings.get()});
//  };
//}

function initAdminSockets(Socket) {
  // Needed by default settings template for requesting a sync of the settings (when the user requests a save or reset)
  Socket.settings["sync" + settings.Id] = function (socket, data, cb) {
    settings.sync(function (settings) { cb(null, settings); });
  };
  // Needed by default settings template for fetching the default settings (when the user requests a reset)
  Socket.settings["get" + settings.Id + "Defaults"] = function (socket, data, cb) {
    cb(null, settings.createDefaultWrapper());
  };
}

module.exports.init = function () {
  //initUserSockets(require.main.require("./src/socket.io/plugins"));
  initAdminSockets(require.main.require("./src/socket.io/admin"));
};
