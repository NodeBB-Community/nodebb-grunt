"use strict";

var settings = require('./settings');

var pages = [
  {
    name: settings.pkg.nbbpm.name,
    icon: 'fa-chevron-circle-right',
    route: "plugins/" + settings.id,
    template: function (req, res) {
      return {
        id: settings.pkg.name,
        name: settings.pkg.nbbpm.name,
        version: settings.pkg.version,
        settings: settings.get()
      };
    }
  }
];

function initPageRoute(router, uiMiddleware, page) {
  var renderFn = function (req, res) {
    res.render("admin/" + page.route, (typeof page.template === "function" ? page.template(req, res) : false) || {});
  };

  router.get("/admin/" + page.route, uiMiddleware, renderFn);
  router.get("/api/admin/" + page.route, renderFn);
}

exports.addNavigation = function (header, cb) {
  var page;
  for (var i = 0; i < pages.length; i++) {
    page = pages[i];
    header.plugins.push({name: page.name, icon: page.icon, route: page.route});
  }
  cb(null, header);
};

exports.onInit = function (data, cb) {
  var page;
  for (var i = 0; i < pages.length; i++) {
    page = pages[i];
    initPageRoute(data.router, data.middleware.admin.buildHeader, page);
  }
  cb(null, data);
};
