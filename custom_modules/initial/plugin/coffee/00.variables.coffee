pkg = require './package.json'
plg = require './plugin.json'

Configuration = require './services/Configuration'
Route = require './services/Route'

release = false

plugin = Object.freeze
  name: plg.id.substring 14
  version: pkg.version
  adminPage:
    name: plg.name
    icon: 'fa-wrench' # Any icon to symbolize the plugin (see http://fontawesome.io/icons/)
    route: "/plugins/#{plg.id.substring 14}"

defConfig = {}

cfg = new Configuration plugin, defConfig, false, !release