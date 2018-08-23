let asyncQueue: Promise<any> = Promise.resolve();

export function wrapAsync<T>(p: Promise<T>): Promise<T> {
  asyncQueue = asyncQueue.then(() => p);
  return p;
}

//TODO  -add length ???

function runTrackAsync(func) {
  return function() {
    let self = this;
    let args = arguments;

    let r = func.apply(self, args);
    wrapAsync(r);
    return r;
  };
}

export function trackAsync() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let wrapped = target[propertyKey];
    descriptor.value = target[propertyKey] = runTrackAsync(wrapped);
  };
}