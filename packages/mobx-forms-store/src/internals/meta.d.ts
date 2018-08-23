import { EntityTypeCfg } from '../interfaces';
import { IEntityStore } from './interfaces';
export declare class EntityPropCfg {
    name?: string;
    referenceTypeName?: string;
    isReference?: boolean;
    referencePropName?: string;
    isLazy?: boolean;
    isNested?: boolean;
    nestedTypeName?: string;
    isNestedCollection?: boolean;
    nestedCollTypeName?: string;
    isKey?: boolean;
}
export declare class EntityTypeMeta {
    props: EntityPropMeta[];
    typeName: string;
    constructor(cfg: EntityTypeCfg);
    getProp(name: string): EntityPropMeta;
}
export declare class EntityPropMeta extends EntityPropCfg {
    constructor(cfg: EntityPropCfg);
    isSimple(): boolean;
}
export declare class EntityMetaProvider {
    private metas;
    stores: {};
    private ctors;
    private lazyCtors;
    constructor(metas: EntityTypeMeta[]);
    addMeta(m: EntityTypeMeta): void;
    getType(typeName: string): EntityTypeMeta;
    getIdField(typeName: any): string;
    regStore<T>(typeName: any, store: IEntityStore<T>): void;
    getLazyCtor(rootType: any, field: any, realCtor: any, isCollection: any): (v: any, d?: any) => void;
    getEntityCtor(typeName: any): (v: any, d?: any) => void;
    tryGetKeyGetter(itemType: EntityTypeMeta): (o: any) => string;
}
