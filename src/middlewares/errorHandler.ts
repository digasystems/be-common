import { ValidationError } from 'express-validation';
import { Request, Response, NextFunction } from "express";
import { errorResponse } from '../utils/functions';
import { mainLogger } from '../logger';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => { // do not remove unused next otherwise it breaks
    if (err instanceof ValidationError) {
        const message = err?.details?.body ? err?.details?.body[0].message : "Validation error";
        return errorResponse(req, res, err, { message: message, textCode: "VALIDATION_ERROR", code: 400 });
    } else if (err && err.message === 'validation error') {
        let messages = err.errors.map((e: { field: any; }) => e.field);
        if (messages.length && messages.length > 1) {
            messages = `${messages.join(', ')} are required fields`;
        } else {
            messages = `${messages.join(', ')} is required field`;
        }
        return errorResponse(req, res, err, { message: "Validation error", textCode: "VALIDATION_ERROR", code: 400 });
    } else {
        return errorResponse(req, res, err, { message: "Generic error", textCode: "GENERIC_ERROR", code: 400 });
    }
};

export default errorHandler;
