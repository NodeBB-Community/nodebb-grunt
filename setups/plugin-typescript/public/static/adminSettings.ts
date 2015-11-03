"use strict";

var id = "@{id}";
var settingsId = "@{name}";
var elements = {
  wrapper: $("form#" + id + "-settings"),
  actions: {
    save: $("button#settings-save"),
    reset: $("button#settings-reset"),
    purge: $("button#settings-purge")
  }
};

var modules = ["settings"];
require(modules, function (settings) {
  var onChange;
  onChange = function () {};
  settings.sync(settingsId, elements.wrapper, onChange);
  elements.actions.save.click(function (e) {
    e.preventDefault();
    return settings.persist(settingsId, elements.wrapper, function () {
      socket.emit("admin.settings.sync@{Id}");
      return onChange();
    });
  });
  elements.actions.reset.click(function (e) {
    e.preventDefault();
    return settings.sync(settingsId, elements.wrapper, onChange);
  });
  return elements.actions.purge.click(function (e) {
    e.preventDefault();
    return socket.emit("admin.settings.get@{Id}Defaults", null, function (err, data) {
      if (err != null) {
        return console.error(err);
      }
      return settings.set(settingsId, data, elements.wrapper, function () {
        socket.emit("admin.settings.sync@{Id}");
        return onChange();
      });
    });
  });
});
