"use strict";

var settings = require("./settings");

/*
 * This file triggers actions when this plugin gets activated.
 */

module.exports = function () { settings.setOnEmpty(); };
