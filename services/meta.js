"use strict";

module.exports.authorObjectToString = function (obj) {
  if (typeof obj.name !== "string") {
    return "";
  }
  var string = obj.name || "";
  if (obj.email) {
    string += " <" + obj.email + ">";
  }
  if (obj.url) {
    string += " (" + obj.url + ")";
  }
  return string;
};

module.exports.authorStringToObject = function (string) {
  var obj = {};
  var name = /^[^<\(]*/.exec(string);
  if (name == null) {
    return null;
  }
  obj.name = name[0].trim();
  string = string.substring(name[0].length);
  var email = /^<([^>]*)>[^\(]*/.exec(string);
  if (email != null) {
    obj.email = email[1];
    string = string.substring(email[0].length);
  }
  var url = /^\(([^\)]*)\)/.exec(string);
  if (url != null) {
    obj.url = url[1];
  }
  return obj;
};
