export class DisposeList{
  arr = [];

  add(callback){
    this.arr.push(callback);
  }

  run(){
    this.arr.forEach(x=>x());
    this.arr = [];
  }
}