settings = require './settings'

SocketModules = require.main.require './src/socket.io/modules'
SocketAdmin = require.main.require './src/socket.io/admin'

initSockets = ->
  # called by clients to fetch plugin-data
  SocketModules[settings.iD] = (socket, data, cb) ->
    cb null,
      dev: settings.dev
      version: settings.pkg.version
      settings: settings.get()

  # called by admin-page to refresh settings
  SocketAdmin.settings["sync#{settings.Id}"] = (socket, data, cb) ->
    settings.sync (settings) -> cb null, settings

  # called by admin-page to fetch default settings
  SocketAdmin.settings["get#{settings.Id}Defaults"] = (socket, data, cb) ->
    cb null, settings.createDefaultWrapper()
