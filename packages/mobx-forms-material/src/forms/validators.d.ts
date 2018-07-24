import { IFormField, IValidator } from './basic';
export declare class Validation {
    static requiredMsg(t: IFormField): string;
    static required<T>(): IValidator<T>;
}
