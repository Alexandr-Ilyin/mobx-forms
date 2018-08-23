export interface IEntityStore<T> {
    getCached(refVal: any): T;
    getItem(refVal: any, fields?: string[]): Promise<T>;
    loadFieldValue(entityId: any, field: string): Promise<T>;
    saveLoadedFieldOffline(entityId: any, field: string, value: any): Promise<any>;
}
