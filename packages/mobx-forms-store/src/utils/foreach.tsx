export async function foreach<T>(arr: T[], func: (x: T) => Promise<any>): Promise<any> {
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    await func(item);
  }
}