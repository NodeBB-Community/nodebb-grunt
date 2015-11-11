"use strict";

/*
 * This file defines a basic module that provides some information.
 *
 * Files within the public/scripts/ directory get meta-replaced by default (thus @{...} gets resolved within the
 * grunt-tasks).
 */

define("@{type.name}/@{id}", function () {
  var version = "@{>version}".split("+");

  return {
    id: "@{name}",
    name: "@{nbbpm.name}",
    version: version[0],
    versionMeta: version[1] != null ? version[1] : null
  };
});
