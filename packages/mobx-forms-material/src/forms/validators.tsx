import { IFormField, IValidator } from './basic';

export class Validation {
  static requiredMsg(t:IFormField) : string{
    if (t.displayName)
      return "Field " + t.displayName +" is required";
    return "Field is required";
  }

  static required<T>() : IValidator<T>{
    return (val:any, f)=>{
      if (val==null || val==="")
        return Validation.requiredMsg(f);

      if (val && val.length===0)
        return Validation.requiredMsg(f);
    }
  }
}