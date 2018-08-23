
export function removeArrayItem<T>(x: T, items: T[]) {
  let index = items.findIndex(i => i === x);
  if (index >= 0) {
    items.splice(index, 1);
  }
}