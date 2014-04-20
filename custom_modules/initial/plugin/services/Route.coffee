module.exports =
  templateAdmin: (app, middleware, route, obj = {}, template = "admin#{route}") ->
    this.get app, middleware.admin.buildHeader, "/admin#{route}", (req, res, ignored) ->
      res.render template, obj
  template: (app, middleware, route, obj = {}, template = route.substring 1) ->
    this.get app, middleware.admin.buildHeader, route, (req, res, ignored) ->
      res.render template, obj
  addAdminNavigations: (plugins...) ->
    (header, cb) ->
      for plugin in plugins
        header.plugins.push
          name: plugin.adminPage.name
          icon: plugin.adminPage.icon
          route: plugin.adminPage.route
      cb null, header
  get: (app, middleware, url, cb, cbApi = cb) ->
    app.get url, middleware, cb
    app.get "/api#{url}", cbApi if cbApi?
  post: (app, middleware, url, cb, cbApi = cb) ->
    app.post url, middleware, cb
    app.post "/api#{url}", cbApi if cbApi?