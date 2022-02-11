"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.constants = exports.Mailer = exports.functions = exports.loggers = exports.app = exports.initialize = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = __importDefault(require("./constants"));
exports.constants = constants_1.default;
const express_1 = __importStar(require("./express"));
Object.defineProperty(exports, "app", { enumerable: true, get: function () { return express_1.app; } });
const loggers = __importStar(require("./logger"));
exports.loggers = loggers;
const logger_1 = require("./logger");
const socketio_1 = __importStar(require("./socketio"));
Object.defineProperty(exports, "io", { enumerable: true, get: function () { return socketio_1.io; } });
const functions = __importStar(require("./utils/functions"));
exports.functions = functions;
const index_1 = __importDefault(require("./utils/mailer/index"));
exports.Mailer = index_1.default;
const initialize = ({ httpPort, routers, ssl, docs }) => {
    const options = {};
    if (ssl?.active == "false")
        ssl.active = false;
    if (ssl?.active) {
        try {
            try {
                options.key = fs_1.default.readFileSync(path_1.default.join(process.cwd(), './key.pem'));
                options.cert = fs_1.default.readFileSync(path_1.default.join(process.cwd(), './cert.pem'));
                options.pfx = fs_1.default.readFileSync(path_1.default.join(process.cwd(), './cert.pfx'));
                options.passphrase = ssl?.passphrase;
                logger_1.mainLogger.info("Certificato SSL ok");
                logger_1.mainLogger.info(path_1.default.join(process.cwd(), './cert.pfx'));
            }
            catch (e) {
                if (!options.key && !options.cert && !options.pfx) {
                    logger_1.mainLogger.error("Certificato SSL non trovato");
                    throw Error("No certificate found! Expected locations: ./cert.pfx, ./cert.pem', ./key.pem'");
                }
            }
        }
        catch (e) {
            logger_1.mainLogger.warn(e);
            options.pfx = null;
            options.passphrase = null;
        }
    }
    const httpServer = (ssl?.active ? require('https') : require('http')).createServer(options, express_1.app);
    (0, express_1.default)({ httpPort, routers, httpServer, docs });
    (0, socketio_1.default)({ httpServer });
    httpServer.listen(httpPort, () => {
        logger_1.mainLogger.info(`Listening http requests on port ${httpPort}`);
    });
};
exports.initialize = initialize;
