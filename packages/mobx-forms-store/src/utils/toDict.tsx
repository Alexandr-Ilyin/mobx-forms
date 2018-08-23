export function toDict<T>(arr: T[], f: (t: T) => any): { [key: string]: T } {
  let hashSet = {};
  for (let i = 0; i < arr.length; i++) {
    let obj = arr[i];
    hashSet[f(obj)] = obj;
  }
  return hashSet;
}