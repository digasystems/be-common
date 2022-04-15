import { NextFunction, Request, Response } from "express";
declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export default errorHandler;
