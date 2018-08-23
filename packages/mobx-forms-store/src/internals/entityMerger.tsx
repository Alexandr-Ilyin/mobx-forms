import * as  _  from "lodash";
import { EntityMetaProvider, EntityTypeMeta } from './meta';
import { toDict } from '../utils/toDict';
import { guid } from '../utils/guid';


export class EntityMerger {
  private metaProvider: EntityMetaProvider;

  constructor(metaProvider: EntityMetaProvider) {
    this.metaProvider = metaProvider;
  }

  merge(oldVals, newVals, type: EntityTypeMeta): any {
    let current = _.cloneDeep(oldVals);
    this.__merge(current, newVals, type);
    return current;
  }

  private __merge(current, newVals, type: EntityTypeMeta): any {
    if (!newVals) {
      throw new Error("Object expected");
    }

    for (let k in newVals) {
      if (!newVals.hasOwnProperty(k) || typeof(newVals[k]) === 'function') {
        continue;
      }

      let p = type.getProp(k);
      if (!p || p.isSimple()) {
        current[k] = newVals[k];
      } else if (p.isNested) {
        if (!current[k]) {
          current[k] = {};
        }
        this.__merge(current[k], newVals[k], this.metaProvider.getType(p.nestedTypeName));
      } else if (p.isNestedCollection) {
        if (!current[k]) {
          current[k] = [];
        }

        let currentArr = current[k];
        let newArr = newVals[k];

        let itemType: EntityTypeMeta = this.metaProvider.getType(p.nestedCollTypeName);
        let itemKeyGetter = this.metaProvider.tryGetKeyGetter(itemType);
        if (itemKeyGetter == null) {
          current[p.name] = newArr;
        }

        let cd = toDict(currentArr, x => (itemKeyGetter(x) || guid()));
        let nd = toDict(newArr, x => (itemKeyGetter(x) || guid()));

        let updatedValue = [];
        for (let key in nd) {
          let newItem = nd[key];
          let oldItem = cd[key] || {};
          this.__merge(oldItem, newItem, itemType);
          updatedValue.push(oldItem);
        }
        current[p.name] = updatedValue;
      }
    }
    return current;
  }
}
