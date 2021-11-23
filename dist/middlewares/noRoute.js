"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../utils/functions");
const noRoute = async (req, res, next) => {
    res.status(404);
    if (req.accepts('json')) {
        (0, functions_1.errorResponse)(req, res, undefined, { message: "Resource not found.", textCode: "NOT_FOUND", code: 404 });
        return;
    }
    res.type('txt').send('Resource not found.');
};
exports.default = noRoute;
