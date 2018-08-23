import * as  _  from "lodash";
import * as  diff  from "fast-diff";
import { toDict } from '../utils/toDict';
import { ILazyWrapper } from '../utils/lazy';
import { applyJsonDiff } from '../utils/diffTools';

export interface LogEntry<T> {
  id?;
  entityId;
  timeStamp;
  parentLogId?;
  diff?: any;
  value?: T;
  selected?: boolean;
}

export class EntityLog<T> {
  private logDic: { [p: string]: LogEntry<any> };
  private logs: LogEntry<T>[];
  wrapper :ILazyWrapper;

  constructor(logs: LogEntry<T>[], wrapper :ILazyWrapper) {
    this.logs = logs;
    this.logDic = toDict(logs, x => x.id);
    this.wrapper = wrapper;
  }

  getItems(): LogEntry<T>[] {
    return this.logs;
  }

  getMergedVersion(logId, recCheck?): T {
    let t = this._getMergedVersion(logId, recCheck);
    let wrapped = this.wrapper.wrapLazyFields(t);
    return wrapped;
  }

  _getMergedVersion(logId, recCheck?): T {
    if (!recCheck) {
      recCheck = 1;
    }
    if (recCheck > 1000) {
      throw new Error("Too deep recursion");
    }

    let e = this.logDic[logId];
    if (!e) {
      return null;
    }
    if (e.value) {
      return e.value;
    }

    if (e.parentLogId) {
      let prev = this._getMergedVersion(e.parentLogId, recCheck + 1);
      if (!prev) {
        return null;
      }
      let result = applyJsonDiff(prev, e.diff);
      return result;
    }
    return null;
  }
}

