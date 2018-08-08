"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Validation {
    static requiredMsg(t) {
        if (t.displayName)
            return "Field " + t.displayName + " is required";
        return "Field is required";
    }
    static required() {
        return (val, f) => {
            if (val == null || val === "")
                return Validation.requiredMsg(f);
            if (val && val.length === 0)
                return Validation.requiredMsg(f);
        };
    }
}
exports.Validation = Validation;
