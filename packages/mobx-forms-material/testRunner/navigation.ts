

export function getUrlParam(url, param) {
  var m = url.match(new RegExp(param + "\=(.*?)(\&|$|#)"));
  return m && decodeURIComponent(m[1]);
}

export function setUrlParam(url, param, value) {
  var url = url.replace(/#.*/,"");
  var sep = url.indexOf("?") >= 0 ? "&" : "?";
  url = url.replace(new RegExp(param + "\=.*?(\&|$)", "g"), "");
  url = url + sep + param + "=" + encodeURIComponent(value);
  url = url.replace("&&", "&");
  url = url.replace("?&", "?");
  return url;
}

export function setHashUrlParam(url, param, value) {
  var sep = url.indexOf("?") >= 0 ? "&" : "?";
  url = url.replace(new RegExp(param + "\=.*?(\&|$)", "g"), "");
  url = url + sep + param + "=" + encodeURIComponent(value);
  url = url.replace("&&", "&");
  url = url.replace("?&", "?");
  return url;
}
