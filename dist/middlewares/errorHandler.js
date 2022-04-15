"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validation_1 = require("express-validation");
const functions_1 = require("../utils/functions");
const errorHandler = (err, req, res, next) => {
    let errorMessage = "Generic error";
    let errorTextcode = "GENERIC_ERROR";
    let errorCode = 400;
    console.log("error class name:", err?.constructor?.name);
    console.log(err);
    if (err && (err instanceof express_validation_1.ValidationError || err?.message?.toLowerCase() == 'validation error')) {
        const message = err?.details?.body ? err?.details?.body[0].message : "Validation error";
        errorMessage = message;
        errorTextcode = "VALIDATION_ERROR";
        errorCode = 400;
    }
    else if (err && err.message === 'validation error') {
        let messages = err.errors.map((e) => e.field);
        if (messages.length && messages.length > 1) {
            messages = `${messages.join(', ')} are required fields`;
        }
        else {
            messages = `${messages.join(', ')} is required field`;
        }
        errorMessage = "Validation error";
        errorTextcode = "VALIDATION_ERROR";
        errorCode = 400;
    }
    return (0, functions_1.errorResponse)(req, res, err, { message: errorMessage, textCode: errorTextcode, code: errorCode });
};
exports.default = errorHandler;
