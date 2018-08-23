import { EntityMetaProvider, EntityTypeMeta } from './meta';
export declare class EntityMerger {
    private metaProvider;
    constructor(metaProvider: EntityMetaProvider);
    merge(oldVals: any, newVals: any, type: EntityTypeMeta): any;
    private __merge;
}
