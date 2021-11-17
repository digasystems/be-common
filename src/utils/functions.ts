import { Request, Response } from "express";
import { createCipheriv, createDecipheriv } from "crypto";
import logger from "../logger";

type errOptions = { message?: string, textCode?: string, code?: number, data?: any, }

export const successResponse = (req: Request, res: Response, data?: any, code = 200) => {
    return res.status(code).send(data);
};

export const errorResponse = (req: Request, res: Response, error: any = {}, options?: errOptions,) => {
    res.status(options?.code || 500).json({
        code: options?.code || 500,
        message: options?.message || error?.message,
        textCode: options?.textCode || error?.code,
        data: options?.data || error?.data,
        details: error?.details,
        success: false,
    })
    return res.send();
};

export const validateFields = (object: { [x: string]: any; }, fields: any[]) => {
    const errors: any[] = [];
    fields.forEach((f: string | number) => {
        if (!(object && object[f])) {
            errors.push(f);
        }
    });
    return errors.length ? `${errors.join(', ')} are required fields.` : '';
};


export class CustomError extends Error {
    code: string;
    data: any;

    constructor(message: string, code: string, data?: any) {
        super();
        this.message = message;
        this.code = code;
        this.data = data;
    }
}

export const uniqueId = (length = 13) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const iv = "098f6bcd4621d373cade4e832627b4f6".slice(0, 16);
const key = "098f6bcd4621d373cade4e832627b4f6".slice(0, 16);

export const cryptMiddleware = (plainString: string) => {
    const mykey = createCipheriv('aes-128-cbc', key, iv);
    var mystr = mykey.update(plainString, 'utf8', 'hex')
    mystr += mykey.final('hex');

    let encryptedString = mystr;

    return encryptedString;
}

export const decryptMiddleware = (encryptedString?: string) => {
    if (!encryptedString) return false;
    try {
        const mykey = createDecipheriv('aes-128-cbc', key, iv);
        var mystr = mykey.update(Buffer.from(encryptedString, "hex"));
        let plainString = Buffer.concat([mystr, mykey.final()]);;

        return plainString.toString();
    } catch (err) {
        logger.error(err)
    }
    return "";
}

export const parseIp = (req) => req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress