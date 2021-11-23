import { Request, Response } from "express";
declare type errOptions = {
    message?: string;
    textCode?: string;
    code?: number;
    data?: any;
};
export declare const successResponse: (req: Request, res: Response, data?: any, code?: number) => Response<any, Record<string, any>>;
export declare const errorResponse: (req: Request, res: Response, error?: any, options?: errOptions | undefined) => Response<any, Record<string, any>>;
export declare const validateFields: (object: {
    [x: string]: any;
}, fields: any[]) => string;
export declare class CustomError extends Error {
    code: string;
    data: any;
    constructor(message: string, code: string, data?: any);
}
export declare const uniqueId: (length?: number) => string;
export declare const cryptMiddleware: (plainString: string) => string;
export declare const decryptMiddleware: (encryptedString?: string | undefined) => string | false;
export declare const parseIp: (req: any) => any;
export declare function getPagination(options: {
    models: any;
    model: any;
    page: number;
    limit: number;
    sortBy: any;
    globalFilter: string;
    include?: any;
    filters?: any;
}): Promise<any>;
export declare const sanitizeUser: (user: any) => {
    id: any;
    firstName: any;
    lastName: any;
    email: any;
    phone: any;
    isVerified: any;
    isAdmin: any;
    Roles: any;
    Permissions: any;
    createdAt: any;
    profilePicture: string;
    displayName: string;
};
export {};
