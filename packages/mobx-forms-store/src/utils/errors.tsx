import * as  _ from "lodash";

function unwrapError(e) {
  if (e.httpResponse && e.httpResponse.data) {
    e = e.httpResponse.data;
  }
  if (e.error && e.error.response && e.error.response.body) {
    e = e.error.response.body;
  }

  if (_.isString(e) && /^\s*\{/.test(e)) {
    try {
      e = JSON.parse(e);
    } catch (err) {
    }

  }
  return e;
}

export function isConcurrencyError(e) {
  e = unwrapError(e);
  if (_.isObject(e)) {

    if (e.exceptionType && /OptimisticConcurrencyException/.test(e.exceptionType)) {
      return true;
    }

    if (e.ExceptionType && /OptimisticConcurrencyException/.test(e.ExceptionType)) {
      return true;
    }
    if (e.InnerException || e.innerException) {
      return isConcurrencyError(e.InnerException || e.innerException);
    }
  }
  return false;
}

export function isOfflineError(err) {
  if (err.httpResponse && err.status === 0) {
    return true;
  }
  if (err.message && /offline/i.test(err.message)) {
    return true;
  }
  if (err.isOfflineError) {
    return true;
  }
  return false;
}
