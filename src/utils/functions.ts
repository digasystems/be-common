import { createCipheriv, createDecipheriv } from "crypto";
import { endOfDay, startOfDay } from "date-fns";
import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import { mainLogger } from "../logger";

type errOptions = { message?: string, textCode?: string, code?: number, data?: any, }

export const successResponse = (req: Request, res: Response, data?: any, code = 200) => {

    return res?.status(code).json({ code: 200, data: data, success: true, })
};

export const errorResponse = (req: Request, res: Response, error: any = {}, options?: errOptions,) => {
    mainLogger.error(`ERROR ${error?.code || 500} ${error?.name || ""} ${error?.message || ""}`);
    if ((!error?.code && !options?.code) || error?.code == 500 || options?.code == 500) {
        console.log(error, options) // winston sucks and does not display errors stack
    }
    res?.status(options?.code || 500).json({
        code: options?.code || 500,
        message: options?.message || error?.message,
        textCode: options?.textCode || error?.code,
        data: options?.data || error?.data,
        details: error?.details,
        success: false,
    })
    return res?.send();
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
        mainLogger.error(err)
    }
    return "";
}

export const parseIp = (req) => req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress

export async function getPagination(options:
    { models: any, model: any, page: number, limit: number, sortBy: any, globalFilter: string, include?: any, filters?: any }
) {
    const { models, model, page, limit, sortBy, globalFilter, include, filters } = options;
    let sortBySeq: any = [];
    if (sortBy?.length) {
        for (const s of sortBy) {
            if (s.id.includes(".")) {
                const modelName: keyof typeof models = s.id.split('.')[0];
                const fieldId = s.id.split('.')[1];
                const actualModel: any = models[modelName];
                const assocAlias = s.associationAlias || modelName;
                if (actualModel) sortBySeq.push([{ model: actualModel, as: assocAlias }, fieldId, s.desc ? "DESC" : "ASC"]);
                else sortBySeq.push([Sequelize.literal(`${s.id}`), s.desc ? "DESC" : "ASC"]);
            } else
                sortBySeq.push([s.id, s.desc ? "DESC" : "ASC"]);
        }
    }

    const globalFilterWhere: any = Object.keys(model.rawAttributes).filter((attr, index) => {
        const type = model.rawAttributes[attr].type.key;
        if (type === "STRING" || type === "INTEGER") return true;
        else return false;
    }).reduce((acc: any, obj: any) => {
        if (globalFilter && globalFilter !== "" && globalFilter.trim() !== "") {
            acc.push({ [obj]: { [Op.like]: `%${globalFilter}%` } });
            return acc;
        }
    }, []);

    var filtersWhere: any;
    if (filters)
        filtersWhere = filters.reduce(
            (acc: any, obj: any) => {
                if (Array.isArray(obj.value)) { // se è un array di valori
                    const arrOfOR: any = [];// support obj value as array
                    for (const elem of obj.value) {
                        if (elem.exact)
                            arrOfOR.push({ [obj.id]: `${elem.value}` });
                        else
                            arrOfOR.push({ [obj.id]: { [Op.like]: `%${elem.value}%` } });
                    }
                    acc.push({ [Op.or]: arrOfOR });
                    return acc;
                }

                if (obj?.value?.type === "date") { // se è tipo data
                    const inputDate = new Date(obj?.value?.value);
                    if (inputDate)
                        acc.push({ [obj.id]: { [Op.between]: [startOfDay(inputDate).toISOString(), endOfDay(inputDate).toISOString()] } });
                    return acc;
                }
                if (obj?.value?.type === "number") { // se è tipo numero
                    const input = parseFloat(obj?.value?.value);
                    if (input || input == 0) acc.push({ [obj.id]: input });
                    return acc;
                }

                if (obj?.id?.includes(".")) { // se è relazionato
                    const arrOfOR: any = [];
                    if (obj?.value?.searchFor) { // il campo del valore relazionato
                        obj?.value?.searchFor?.forEach((attr: string) => {
                            arrOfOR.push({ [`$${obj?.id?.split(".")[0]}.${attr}$`]: { [Op.like]: `%${obj?.value?.value || ""}%` } });
                        });
                        acc.push({ [Op.or]: arrOfOR });
                    } else {
                        acc.push({ [`$${obj.id}$`]: obj.value }); //<--- To make sequlize realize that is a nested column
                    }
                    return acc;
                }

                if (!(obj?.exact)) acc.push({ [obj.id]: { [Op.like]: `%${obj.value}%` } });  // se deve matchare con ricerca
                else acc.push({ [obj.id]: obj.value }); // se deve matchare l'esatto


                return acc;
            }, [])

    var where: any;
    if (filtersWhere && globalFilterWhere)
        where = { [Op.and]: [{ [Op.and]: filtersWhere }, { [Op.or]: [...globalFilterWhere] }] };
    else if (filtersWhere)
        where = { [Op.and]: filtersWhere };
    else if (globalFilterWhere)
        where = { [Op.or]: [...globalFilterWhere] };


    const list = await model.findAndCountAll({
        order: sortBySeq,
        offset: (page - 1) * limit,
        limit: limit > 500 ? 500 : limit,
        where,
        include,
    });


    return list;
}




export async function getPaginationDataGridPro(options: { models: any, model: any, page: number, limit: number, sorting: any, globalFilter: string, include?: any, filters?: any }) {
    const { models, model, page, limit, sorting, globalFilter, include, filters } = options;

    let sortBySeq: any = [];
    if (sorting?.length) {
        for (const s of sorting) {
            if (s.field.includes(".")) {
                const modelName: keyof typeof models = s.field.split('.')[0];
                const fieldId = s.field.split('.')[1];
                const actualModel: any = models[modelName];
                const assocAlias = s.associationAlias || modelName;
                if (actualModel) sortBySeq.push([{ model: actualModel, as: assocAlias }, fieldId, s.sort]);
                else sortBySeq.push([Sequelize.literal(`${s.field}`), s.sort]);
            } else
                sortBySeq.push([s.field, s.sort]);
        }
    }

    const globalFilterWhere: any = Object.keys(model.rawAttributes).filter((attr, index) => {
        const type = model.rawAttributes[attr].type.key;
        if (type === "STRING" || type === "INTEGER") return true;
        else return false;
    }).reduce((acc: any, obj: any) => {
        if (globalFilter && globalFilter !== "" && globalFilter.trim() !== "") {
            acc.push({ [obj]: { [Op.like]: `%${globalFilter}%` } });
            return acc;
        }
    }, []);

    let filtersWhere: any;
    if (filters && filters?.items?.length) {
        let linkOp = Op.or;
        if (filters.linkOperator == "and") linkOp = Op.and;

        filtersWhere = {
            [linkOp]: filters?.items?.map((item) => {
                let prefix = "", suffix = "";
                let eqOperator = Op.like;

                switch (item.operatorValue) {
                    case "isNotEmpty":
                        return { [item.columnField]: { [Op.or]: [{ [Op.not]: null }, { [Op.ne]: "" }] } };
                    case "isEmpty":
                        return { [item.columnField]: { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: "" }] } };
                    case "startsWith":
                        eqOperator = Op.like
                        prefix = "%";
                        suffix = "";
                        break;
                    case "startsWith":
                        eqOperator = Op.like
                        prefix = "%";
                        suffix = "";
                        break;
                    case "endsWith":
                        eqOperator = Op.like
                        prefix = "%";
                        suffix = "";
                        break;
                    case "contains":
                        eqOperator = Op.like
                        prefix = "%";
                        suffix = "%";
                        break;
                    case "equals":
                        eqOperator = Op.eq
                        prefix = "";
                        suffix = "";
                        break;
                    default:
                        eqOperator = Op.like
                        prefix = "%";
                        suffix = "%";
                        break;
                }

                return { [item.columnField]: { [eqOperator]: `${prefix}${item.value}${suffix}` } };
            })

        }
    }

    let where: any;
    if (filtersWhere && globalFilterWhere)
        where = { [Op.and]: [{ [Op.and]: filtersWhere }, { [Op.or]: [...globalFilterWhere] }] };
    else if (filtersWhere)
        where = { [Op.and]: filtersWhere };
    else if (globalFilterWhere)
        where = { [Op.or]: [...globalFilterWhere] };

    const list = await model.findAndCountAll({
        order: sortBySeq,
        offset: (page - 1) * limit,
        limit: limit > 500 ? 500 : limit,
        where,
        include,
    });


    return list;
}