"use strict";

/*
 * This files gets called from the admin-page of the module to handle settings.
 *
 * Files within the public/static/scripts/ directory get meta-replaced by default (thus @{...} gets resolved within the
 * grunt-tasks).
 */

require(["settings"], settings => {
  var moduleId = "@{id}";
  var wrapper = $("#" + moduleId + "-settings");

  // synchronize settings instantly
  settings.sync(moduleId, wrapper);

  wrapper.find("#" + moduleId + "-settings-save").click(event => {
    event.preventDefault();
    settings.persist(moduleId, wrapper, () => { socket.emit("admin.settings.sync@{Id}"); });
  });

  wrapper.find("#" + moduleId + "-settings-reset").click(event => {
    event.preventDefault();
    settings.sync(moduleId, wrapper);
  });

  wrapper.find("#" + moduleId + "-settings-purge").click(event => {
    event.preventDefault();
    socket.emit("admin.settings.get@{Id}Defaults", null, (err, data) => {
      settings.set(moduleId, data, wrapper, () => { socket.emit("admin.settings.sync@{Id}"); });
    });
  });
});
