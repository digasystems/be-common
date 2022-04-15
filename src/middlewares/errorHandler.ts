import { NextFunction, Request, Response } from "express";
import { ValidationError } from 'express-validation';
import { errorResponse } from '../utils/functions';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => { // do not remove unused next otherwise it breaks
    let errorMessage = "Generic error";
    let errorTextcode = "GENERIC_ERROR";
    let errorCode = 400;

    console.log("error class name:", err?.constructor?.name);
    console.log(err)

    if (err && (err instanceof ValidationError || err?.message?.toLowerCase() == 'validation error')) {
        const message = err?.details?.body ? err?.details?.body[0].message : "Validation error";
        errorMessage = message;
        errorTextcode = "VALIDATION_ERROR";
        errorCode = 400;
    } else if (err && err.message === 'validation error') {
        let messages = err.errors.map((e: { field: any; }) => e.field);
        if (messages.length && messages.length > 1) {
            messages = `${messages.join(', ')} are required fields`;
        } else {
            messages = `${messages.join(', ')} is required field`;
        }

        errorMessage = "Validation error";
        errorTextcode = "VALIDATION_ERROR";
        errorCode = 400;
    }

    // mainLogger.error(err);

    return errorResponse(req, res, err, { message: errorMessage, textCode: errorTextcode, code: errorCode });
};

export default errorHandler;
