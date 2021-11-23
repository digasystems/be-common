import { NextFunction, Request, Response } from "express";
declare const noRoute: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default noRoute;
