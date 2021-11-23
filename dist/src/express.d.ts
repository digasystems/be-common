import { Router } from "express";
export declare const app: import("express-serve-static-core").Express;
export declare type RouterItem = {
    router: Router;
    middlewares?: any[];
};
declare const initializeHttp: ({ httpPort, routers, httpServer }: {
    httpPort: number;
    routers: RouterItem[];
    httpServer: any;
}) => void;
export default initializeHttp;
