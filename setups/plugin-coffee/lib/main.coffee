settings = require './settings'
adminPages = require './adminPages'

exports.init = (data, cb) ->
  adminPages.onInit data, cb

exports.adminMenu = adminPages.addNavigation

exports.activation = (id) -> if id == settings.pkg.name
  settings.setOnEmpty()
