"use strict";

/*
 * All files within public/scripts/ get executed on client-side as by default plugin.json
 */

require([currentModuleID, "alerts"], function (variables, alerts) {
  var sampleImagePath = RELATIVE_PATH + "/plugins/" + variables.id + "/static/sample.png";

  alerts.alert(
      {
        title: "Plugin loaded",
        message: "You've successfully created a new plugin '" + variables.name + "'.<br/>" +
        "Now please remove the sample within public/scripts/ ;-)<br/><img src=\"" + sampleImagePath + "\"" +
        " alt=\"It seems you've already removed the useless image within public/static/\"/>",
        type: "warn"
      }
  );
});
