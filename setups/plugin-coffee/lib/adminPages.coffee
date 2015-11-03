settings = require './settings'

#================================================== Page Definitions ==================================================#

pages = [
  {
    name: settings.pkg.nbbpm.name
    icon: 'fa-chevron-circle-right' # Any icon to symbolize the plugin (see http://fontawesome.io/icons/)
    route: "plugins/#{settings.id}"
    template: (req, res) ->
      id: settings.pkg.name
      name: settings.pkg.nbbpm.name
      version: settings.pkg.version
      settings: settings.get()
  }
]

#====================================================== Exports  ======================================================#

exports.addNavigation = (header, cb) ->
  for page in pages
    header.plugins.push
      name: page.name
      icon: page.icon
      route: page.route
  cb null, header

initPageRoute = (router, uiMiddleware, page) ->
  templateData = page.template?(req, res) || {}
  renderFn = (req, res) -> res.render "admin/#{page.route}", templateData
  router.get "/admin/#{page.route}", uiMiddleware, renderFn
  router.get "/api/admin/#{page.route}", renderFn

exports.onInit = (data, cb) ->
  router = data.router
  uiMiddleware = data.middleware.admin.buildHeader
  initPageRoute router, uiMiddleware, page for page in pages
  cb null, data
