"use strict";

/*
 * This file defines a basic module that provides some information.
 *
 * It also exposes a global variable currentModuleID to be used by other scripts (not within the meta/ directory).
 *
 * Files within the public/scripts/meta/ directory get meta-replaced by default (thus @{...} gets resolved within the
 * grunt-tasks).
 * It is not recommended to add any more files, rather it is recommended to add additional values to the module
 * definition if needed.
 */

var currentModuleID = "@{type.name}/@{id}"; // jshint ignore:line

console.log("Registering module", currentModuleID);

define(currentModuleID, function () {
  var version = "@{version}".split("+");

  return {
    id: "@{name}",
    name: "@{nbbpm.name}",
    version: version[0],
    versionMeta: version[1] != null ? version[1] : null
  };
});
