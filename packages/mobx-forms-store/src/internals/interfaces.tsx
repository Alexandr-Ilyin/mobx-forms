export interface IEntityStore<T> {
  getCached(refVal): T;
  getItem(refVal, fields?: string[]): Promise<T>;
  loadFieldValue(entityId, field: string): Promise<T>;
  saveLoadedFieldOffline(entityId, field: string, value): Promise<any>;
}