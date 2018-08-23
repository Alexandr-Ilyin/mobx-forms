function runOnce(func, name) {
  return function() {
    let self = this;
    let args = arguments;
    let s = '___loaded_' + name;
    if (self.hasOwnProperty(s)) {
      return self[s];
    }
    return self[s] = func.apply(self, args);
  }
}

export function once() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let wrapped = target[propertyKey];
    descriptor.value = target[propertyKey] = runOnce(wrapped, propertyKey);
  };

}