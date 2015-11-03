"use strict";

var settings = require('./settings');

var SocketModules = require.main.require('./src/socket.io/modules');
var SocketAdmin = require.main.require('./src/socket.io/admin');

function initSockets() {
  SocketModules[settings.iD] = function (socket, data, cb) {
    cb(null, {dev: settings.dev, version: settings.pkg.version, settings: settings.get()});
  };
  SocketAdmin.settings["sync" + settings.Id] = function (socket, data, cb) {
    settings.sync(function (settings) { cb(null, settings); });
  };
  SocketAdmin.settings["get" + settings.Id + "Defaults"] = function (socket, data, cb) {
    cb(null, settings.createDefaultWrapper());
  };
}
