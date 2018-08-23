export function isAbsoluteUrl(url:string):boolean {
  return /\:/.test(url);
}

export function getUrlPath(url:string) {
  var url = combineUrls("http://x.com", url);
  var protocol = url.split(':')[0];
  var path = url.split(':')[1].replace(/\?.*/, "").replace(/^\/*[^\/]*/, "");
  return path;

}

export function combineUrls(url:string, relativeUrl:string):string {
  if (isAbsoluteUrl(relativeUrl))
    return relativeUrl;
  if (/^\//.test(relativeUrl)) {
    if (!isAbsoluteUrl(url))
      return relativeUrl;
    var prefix = url.match(/https?\:[^\\]*\:(\d+)/)[0];
    return prefix + relativeUrl;
  }
  return resolveRelativePath(url, relativeUrl);
}

function resolveRelativePath(url, relativePath) {
  url = url.replace(/\/*$/,"");

  var url1 = url.split('/');
  var url2 = relativePath.split('/');
  var url3 = [];
  for (var i = 0, l = url1.length; i < l; i++) {
    if (url1[i] == '..') {
      url3.pop();
    } else if (url1[i] == '.') {
      continue;
    } else {
      url3.push(url1[i]);
    }
  }
  for (var i = 0, l = url2.length; i < l; i++) {
    if (url2[i] == '..') {
      url3.pop();
    } else if (url2[i] == '.') {
      continue;
    } else {
      url3.push(url2[i]);
    }
  }
  return url3.join('/');
}
