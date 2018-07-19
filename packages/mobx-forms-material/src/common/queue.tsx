export class Queue {
  promise: Promise<any> = Promise.resolve();
  length: number = 0;

  enqueue(p: () => any): Promise<any>;
  enqueue<T>(p: () => Promise<T>): Promise<T> {
    this.length++;
    let result = this.promise.then(
      () => p(),
      () => p()
    );
    this.promise = result.then(
      () => {
        this.length--;

      },
      (err) => {
        this.length--;
        console.log(err);
        return Promise.reject(err);
      });
    return result;
  }

  makeQueued(func) {

    let s = this;
    return function() {
      let args = arguments;
      let self = this;
      return s.enqueue(() => func.apply(self, args));
    };
  }

  isEmpty(): boolean {
    return this.length === 0;
  }
}
