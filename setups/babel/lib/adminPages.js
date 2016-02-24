"use strict";

var settings = require("./settings");

/*
 * This file registers the admin page(s) to render when called.
 */

var pages = [
  {
    name: settings.pkg.nbbpm.name,
    icon: "fa-chevron-circle-right",
    route: "/plugins/" + settings.id,
    template: function () {
      return {
        id: settings.pkg.name,
        name: settings.pkg.nbbpm.name,
        version: settings.pkg.version,
        settings: settings.get()
      };
    }
  }
];

function initPageRoute(router, UIMiddleware, page) {
  function renderPage(req, res) {
    res.render("admin" + page.route, (typeof page.template === "function" ? page.template(req, res) : false) || {});
  }

  router.get("/admin" + page.route, UIMiddleware, renderPage);
  router.get("/api/admin" + page.route, renderPage);
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
