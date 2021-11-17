import { NextFunction, Request, Response } from "express";
import { errorResponse } from '../utils/functions';

const noRoute = async (req: Request, res: Response, next: NextFunction) => {
    res.status(404);

    // respond with json
    if (req.accepts('json')) {
        errorResponse(req, res, undefined, { message: "Resource not found.", textCode: "NOT_FOUND", code: 404 });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Resource not found.');
}

export default noRoute;