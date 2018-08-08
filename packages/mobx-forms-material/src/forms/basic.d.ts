export interface IFieldContainer {
    addField(field: IFormField): any;
    removeField(field: IFormField): any;
}
export interface IFormField {
    displayName?: string;
    isValid(): boolean;
    touch(): any;
}
export interface IValidator<T> {
    (v: T, owner: FormField<T>): string;
}
export declare class FormBase implements IFormField, IFieldContainer {
    fields: IFormField[];
    removeField(field: IFormField): void;
    addField(field: IFormField): void;
    constructor(parent?: IFieldContainer);
    isValid(): boolean;
    touch(): void;
    validate(): boolean;
}
export declare class ArrayField<T extends IFormField> implements IFormField {
    items: T[];
    constructor(parent: FormBase);
    add(field: IFormField): void;
    isValid(): boolean;
    touch(): void;
}
export interface FormFieldCfg<T> {
    required?: boolean;
    defaultValue?: T;
    validations?: IValidator<T>[];
    displayName?: string;
}
export declare class FormField<T> implements IFormField {
    validators: IValidator<T>[];
    value: T;
    displayName: string;
    touched: any;
    loading: any;
    B: any;
    constructor(parent: IFieldContainer, cfg: FormFieldCfg<T>);
    getValue(): T;
    setValue(vals: T): void;
    touch(): void;
    isValid(): boolean;
    readonly error: string;
    readonly visibleError: string;
}
