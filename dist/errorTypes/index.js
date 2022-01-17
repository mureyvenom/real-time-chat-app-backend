"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationError = void 0;
class validationError extends Error {
    constructor(message) {
        super(message);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, validationError.prototype);
    }
}
exports.validationError = validationError;
