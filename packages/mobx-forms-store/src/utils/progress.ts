import {EventEmitter} from 'events';

var progressId = 1;
let minTaskSize = 1;

export class Progress {
  private _children: Array<Progress> = [];
  private _completeCount: number = 0;
  private _totalCount: number;
  private _events;
  private _name;
  private _id;

  constructor(name?: string) {
    this._events = new EventEmitter();
    this._id = "P" + (progressId++);
    this._name = name;
  }

  totalCount(count: number) : Progress{
    this._totalCount = count;
    this.log(this._name+ " - set total:", count)
    this.triggerOnChange();
    return this;
  }



  waitTotalBytes(getCount: Promise<number>): Progress {
    getCount.then(v => {
      this.totalCount(v);
    });
    return this;
  }

  completeCount(length: number) {
    this._completeCount += length;
    this.triggerOnChange();
  }

  child(name?): Progress {
    var progress = new Progress();
    progress._name = name;
    progress.totalCount(1);
    this._children.push(progress);
    progress.onChange(() => this.triggerOnChange());
    return progress;
  }

  complete(completeChildren?: boolean): Progress {
    if (completeChildren) {
      this._runRecursive(x => {
        if (x._totalCount) {
          x._completeCount = x._totalCount;
        }
      });
    }
    if (this._totalCount) {
      this._completeCount = this._totalCount;
    }
    this.triggerOnChange();
    return this;
  }

  private log(...args) {
    //console.log.apply(console, arguments);
  }

  mon<T>(p: Promise<T>) {
    p.then(() => this.complete());
    return p;
  }

  private _runRecursive(f: {(p: Progress, d: number);}, d?) {
    if (!d) {
      d = 0;
    }
    f(this, d);
    for (var i = 0; i < this._children.length; i++) {
      this._children[i]._runRecursive(f, d + 1);
    }
  }

  fullProgress(): number {
    let stat = this.fullStat();
    return stat.completeUnits / stat.fullUnits;
  }

  fullStat(): {completeUnits,fullUnits} {
    var fullUnits = 0.0;
    var completeUnits = 0.0;
    var visited = {};
    this._runRecursive(x => {
      if (visited[x._id]) {
        return;
      }
      visited[x._id] = true;
      if (x._totalCount) {
        fullUnits += x._totalCount;
        completeUnits += x._completeCount;
      }
    });

    return { completeUnits, fullUnits };
  }

  withChild(child: Progress): Progress {
    this._children.push(child);
    child.onChange(() => this.triggerOnChange());
    return this;
  }

  addChild(child: Progress): Progress {
    this._children.push(child);
    child.onChange(() => this.triggerOnChange());
    return child;
  }

  triggerOnChange() {
    this._events.emit("change");
  }

  onChange(handler: ()=>any) {
    this._events.on("change", handler);
  }

  unChange(handler: ()=>any) {
    this._events.removeListener("change", handler);
  }

  getLog() {
    var result = "";
    result += "CURRENT PROGRESS:" + this.fullProgress() + "\n";
    this._runRecursive((x, depth) => {
      var prefix = "";
      for (var i = 0; i < depth; i++) {
        prefix += "    ";
      }

      result += prefix;
      result += x._name || "[unnamed]";
      result += ":";
      result += x._completeCount + "/" + x._totalCount + " bytes";
      result += "\n";
    });
    return result;

  }
}
