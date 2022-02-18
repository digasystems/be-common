"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationDataGridPro = exports.getPagination = exports.parseIp = exports.decryptMiddleware = exports.cryptMiddleware = exports.uniqueId = exports.CustomError = exports.validateFields = exports.errorResponse = exports.successResponse = void 0;
const crypto_1 = require("crypto");
const date_fns_1 = require("date-fns");
const sequelize_1 = require("sequelize");
const logger_1 = require("../logger");
const successResponse = (req, res, data, code = 200) => {
    return res?.status(code).json({ code: 200, data: data, success: true, });
};
exports.successResponse = successResponse;
const errorResponse = (req, res, error = {}, options) => {
    logger_1.mainLogger.error(`ERROR ${error?.code || 500} ${error?.name || ""} ${error?.message || ""}`);
    if ((!error?.code && !options?.code) || error?.code == 500 || options?.code == 500) {
        console.log(error, options);
    }
    res?.status(options?.code || 500).json({
        code: options?.code || 500,
        message: options?.message || error?.message,
        textCode: options?.textCode || error?.code,
        data: options?.data || error?.data,
        details: error?.details,
        success: false,
    });
    return res?.send();
};
exports.errorResponse = errorResponse;
const validateFields = (object, fields) => {
    const errors = [];
    fields.forEach((f) => {
        if (!(object && object[f])) {
            errors.push(f);
        }
    });
    return errors.length ? `${errors.join(', ')} are required fields.` : '';
};
exports.validateFields = validateFields;
class CustomError extends Error {
    code;
    data;
    constructor(message, code, data) {
        super();
        this.message = message;
        this.code = code;
        this.data = data;
    }
}
exports.CustomError = CustomError;
const uniqueId = (length = 13) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.uniqueId = uniqueId;
const iv = "098f6bcd4621d373cade4e832627b4f6".slice(0, 16);
const key = "098f6bcd4621d373cade4e832627b4f6".slice(0, 16);
const cryptMiddleware = (plainString) => {
    const mykey = (0, crypto_1.createCipheriv)('aes-128-cbc', key, iv);
    var mystr = mykey.update(plainString, 'utf8', 'hex');
    mystr += mykey.final('hex');
    let encryptedString = mystr;
    return encryptedString;
};
exports.cryptMiddleware = cryptMiddleware;
const decryptMiddleware = (encryptedString) => {
    if (!encryptedString)
        return false;
    try {
        const mykey = (0, crypto_1.createDecipheriv)('aes-128-cbc', key, iv);
        var mystr = mykey.update(Buffer.from(encryptedString, "hex"));
        let plainString = Buffer.concat([mystr, mykey.final()]);
        ;
        return plainString.toString();
    }
    catch (err) {
        logger_1.mainLogger.error(err);
    }
    return "";
};
exports.decryptMiddleware = decryptMiddleware;
const parseIp = (req) => req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
exports.parseIp = parseIp;
async function getPagination(options) {
    const { models, model, page, limit, sortBy, globalFilter, include, filters } = options;
    let sortBySeq = [];
    if (sortBy?.length) {
        for (const s of sortBy) {
            if (s.id.includes(".")) {
                const modelName = s.id.split('.')[0];
                const fieldId = s.id.split('.')[1];
                const actualModel = models[modelName];
                const assocAlias = s.associationAlias || modelName;
                if (actualModel)
                    sortBySeq.push([{ model: actualModel, as: assocAlias }, fieldId, s.desc ? "DESC" : "ASC"]);
                else
                    sortBySeq.push([sequelize_1.Sequelize.literal(`${s.id}`), s.desc ? "DESC" : "ASC"]);
            }
            else
                sortBySeq.push([s.id, s.desc ? "DESC" : "ASC"]);
        }
    }
    const globalFilterWhere = Object.keys(model.rawAttributes).filter((attr, index) => {
        const type = model.rawAttributes[attr].type.key;
        if (type === "STRING" || type === "INTEGER")
            return true;
        else
            return false;
    }).reduce((acc, obj) => {
        if (globalFilter && globalFilter !== "" && globalFilter.trim() !== "") {
            acc.push({ [obj]: { [sequelize_1.Op.like]: `%${globalFilter}%` } });
            return acc;
        }
    }, []);
    var filtersWhere;
    if (filters)
        filtersWhere = filters.reduce((acc, obj) => {
            if (Array.isArray(obj.value)) {
                const arrOfOR = [];
                for (const elem of obj.value) {
                    if (elem.exact)
                        arrOfOR.push({ [obj.id]: `${elem.value}` });
                    else
                        arrOfOR.push({ [obj.id]: { [sequelize_1.Op.like]: `%${elem.value}%` } });
                }
                acc.push({ [sequelize_1.Op.or]: arrOfOR });
                return acc;
            }
            if (obj?.value?.type === "date") {
                const inputDate = new Date(obj?.value?.value);
                if (inputDate)
                    acc.push({ [obj.id]: { [sequelize_1.Op.between]: [(0, date_fns_1.startOfDay)(inputDate).toISOString(), (0, date_fns_1.endOfDay)(inputDate).toISOString()] } });
                return acc;
            }
            if (obj?.value?.type === "number") {
                const input = parseFloat(obj?.value?.value);
                if (input || input == 0)
                    acc.push({ [obj.id]: input });
                return acc;
            }
            if (obj?.id?.includes(".")) {
                const arrOfOR = [];
                if (obj?.value?.searchFor) {
                    obj?.value?.searchFor?.forEach((attr) => {
                        arrOfOR.push({ [`$${obj?.id?.split(".")[0]}.${attr}$`]: { [sequelize_1.Op.like]: `%${obj?.value?.value || ""}%` } });
                    });
                    acc.push({ [sequelize_1.Op.or]: arrOfOR });
                }
                else {
                    acc.push({ [`$${obj.id}$`]: obj.value });
                }
                return acc;
            }
            if (!(obj?.exact))
                acc.push({ [obj.id]: { [sequelize_1.Op.like]: `%${obj.value}%` } });
            else
                acc.push({ [obj.id]: obj.value });
            return acc;
        }, []);
    var where;
    if (filtersWhere && globalFilterWhere)
        where = { [sequelize_1.Op.and]: [{ [sequelize_1.Op.and]: filtersWhere }, { [sequelize_1.Op.or]: [...globalFilterWhere] }] };
    else if (filtersWhere)
        where = { [sequelize_1.Op.and]: filtersWhere };
    else if (globalFilterWhere)
        where = { [sequelize_1.Op.or]: [...globalFilterWhere] };
    const list = await model.findAndCountAll({
        order: sortBySeq,
        offset: (page - 1) * limit,
        limit: limit > 500 ? 500 : limit,
        where,
        include,
    });
    return list;
}
exports.getPagination = getPagination;
async function getPaginationDataGridPro(options) {
    const { models, model, page, limit, sorting, globalFilter, include, filters } = options;
    let sortBySeq = [];
    if (sorting?.length) {
        for (const s of sorting) {
            if (s.field.includes(".")) {
                const modelName = s.field.split('.')[0];
                const fieldId = s.field.split('.')[1];
                const actualModel = models[modelName];
                const assocAlias = s.associationAlias || modelName;
                if (actualModel)
                    sortBySeq.push([{ model: actualModel, as: assocAlias }, fieldId, s.sort]);
                else
                    sortBySeq.push([sequelize_1.Sequelize.literal(`${s.field}`), s.sort]);
            }
            else
                sortBySeq.push([s.field, s.sort]);
        }
    }
    const globalFilterWhere = Object.keys(model.rawAttributes).filter((attr, index) => {
        const type = model.rawAttributes[attr].type.key;
        if (type === "STRING" || type === "INTEGER")
            return true;
        else
            return false;
    }).reduce((acc, obj) => {
        if (globalFilter && globalFilter !== "" && globalFilter.trim() !== "") {
            acc.push({ [obj]: { [sequelize_1.Op.like]: `%${globalFilter}%` } });
            return acc;
        }
    }, []);
    let filtersWhere;
    if (filters && filters?.items?.length) {
        let linkOp = sequelize_1.Op.or;
        if (filters.linkOperator == "and")
            linkOp = sequelize_1.Op.and;
        filtersWhere = {
            [linkOp]: filters?.items?.map((item) => {
                let prefix = "", suffix = "";
                let eqOperator = sequelize_1.Op.like;
                switch (item.operatorValue) {
                    case "isNotEmpty":
                        return { [item.columnField]: { [sequelize_1.Op.or]: [{ [sequelize_1.Op.not]: null }, { [sequelize_1.Op.ne]: "" }] } };
                    case "isEmpty":
                        return { [item.columnField]: { [sequelize_1.Op.or]: [{ [sequelize_1.Op.is]: null }, { [sequelize_1.Op.eq]: "" }] } };
                    case "startsWith":
                        eqOperator = sequelize_1.Op.like;
                        prefix = "%";
                        suffix = "";
                        break;
                    case "startsWith":
                        eqOperator = sequelize_1.Op.like;
                        prefix = "%";
                        suffix = "";
                        break;
                    case "endsWith":
                        eqOperator = sequelize_1.Op.like;
                        prefix = "%";
                        suffix = "";
                        break;
                    case "contains":
                        eqOperator = sequelize_1.Op.like;
                        prefix = "%";
                        suffix = "%";
                        break;
                    case "equals":
                        eqOperator = sequelize_1.Op.eq;
                        prefix = "";
                        suffix = "";
                        break;
                    default:
                        eqOperator = sequelize_1.Op.like;
                        prefix = "%";
                        suffix = "%";
                        break;
                }
                return { [item.columnField]: { [eqOperator]: `${prefix}${item.value}${suffix}` } };
            })
        };
    }
    let where;
    if (filtersWhere && globalFilterWhere)
        where = { [sequelize_1.Op.and]: [{ [sequelize_1.Op.and]: filtersWhere }, { [sequelize_1.Op.or]: [...globalFilterWhere] }] };
    else if (filtersWhere)
        where = { [sequelize_1.Op.and]: filtersWhere };
    else if (globalFilterWhere)
        where = { [sequelize_1.Op.or]: [...globalFilterWhere] };
    const list = await model.findAndCountAll({
        order: sortBySeq,
        offset: (page - 1) * limit,
        limit: limit > 500 ? 500 : limit,
        where,
        include,
    });
    return list;
}
exports.getPaginationDataGridPro = getPaginationDataGridPro;
