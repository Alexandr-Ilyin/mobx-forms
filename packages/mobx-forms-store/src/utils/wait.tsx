import { Defer } from './defer';

export function wait(time): Promise<void> {
  var defer = new Defer<void>();
  setTimeout(function() {
    defer.resolve();
  }, time);
  return defer.promise();
}