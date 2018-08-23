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