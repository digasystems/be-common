import { NextFunction, Request, Response } from "express";
import { errorResponse } from '../utils/functions';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => { // do not remove unused next otherwise it breaks


    return errorResponse(req, res, err);
};

export default errorHandler;
