"use strict";

/*
 * All files within public/scripts/ get executed on client-side as by default plugin.json
 */

require(["@{type.name}/@{id}", "alerts"], function (module, alerts) {
  var sampleImagePath = RELATIVE_PATH + "/plugins/" + module.id + "/static/sample.png";

  alerts.alert(
      {
        title: "Plugin loaded",
        message: "You've successfully created a new plugin '" + module.name + "'.<br/>" +
        "Now please remove the sample within public/scripts/ ;-)<br/><img src=\"" + sampleImagePath + "\"" +
        " alt=\"It seems you've already removed the useless image within public/static/\"/>",
        type: "warn"
      }
  );
});
