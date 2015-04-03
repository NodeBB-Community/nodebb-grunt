packageJSON = require '../package.json'
Settings = require.main.require './src/settings'

#======================================== Retrieve Information by grunt-tasks  ========================================#

dev = "@{env}" == "development"

#================================================ Instantiate Settings ================================================#

defaultSettings =
  setting1: "Hello World!",
  custom: true

exports = module.exports = new Settings packageJSON.name, packageJSON.version, defaultSettings, null, dev, false

#=================================================== Extend exports ===================================================#

exports[key] = value for key, value of data

exports.id = "@{id}" # my-plugin
exports.Id = "@{Id}" # MyPlugin
exports.iD = "@{iD}" # myPlugin
exports.ID = "@{ID}" # MY_PLUGIN
exports.dev = data.dev
exports.pkg = packageJSON
