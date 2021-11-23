"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validation_1 = require("express-validation");
const functions_1 = require("../utils/functions");
const errorHandler = (err, req, res, next) => {
    if (err instanceof express_validation_1.ValidationError) {
        const message = err?.details?.body ? err?.details?.body[0].message : "Validation error";
        return (0, functions_1.errorResponse)(req, res, err, { message: message, textCode: "VALIDATION_ERROR", code: 400 });
    }
    else if (err && err.message === 'validation error') {
        let messages = err.errors.map((e) => e.field);
        if (messages.length && messages.length > 1) {
            messages = `${messages.join(', ')} are required fields`;
        }
        else {
            messages = `${messages.join(', ')} is required field`;
        }
        return (0, functions_1.errorResponse)(req, res, err, { message: "Validation error", textCode: "VALIDATION_ERROR", code: 400 });
    }
    else {
        return (0, functions_1.errorResponse)(req, res, err, { message: "Generic error", textCode: "GENERIC_ERROR", code: 400 });
    }
};
exports.default = errorHandler;
