"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const noRoute_1 = __importDefault(require("./middlewares/noRoute"));
const functions_1 = require("./utils/functions");
const logger_1 = require("./logger");
const path_1 = __importDefault(require("path"));
const docs_1 = __importDefault(require("./docs"));
const env = process.env.NODE_ENV || "development";
exports.app = (0, express_1.default)();
const initializeHttp = ({ httpPort, routers, httpServer, docs }) => {
    if (env === "production") {
        exports.app.use((0, compression_1.default)());
        exports.app.use((0, helmet_1.default)());
    }
    exports.app.use((0, cors_1.default)());
    exports.app.use(express_1.default.json({ limit: "100mb" }));
    exports.app.use((req, res, next) => {
        logger_1.mainLogger.info(`CALL ${req.url} from ${(0, functions_1.parseIp)(req)}`);
        next();
    });
    exports.app.all('/', (req, res) => (0, functions_1.successResponse)(req, res, process.env.APP_NAME + " " + docs?.version));
    exports.app.use('/logs', express_1.default.static(path_1.default.join(__dirname, "./assets/html/")));
    (0, docs_1.default)(exports.app, { title: docs?.title || "test-title", version: docs?.version || "1.0.0", apis: docs.apis });
    routers.forEach((r) => {
        exports.app.use(...(r.middlewares || []), r.router);
    });
    exports.app.use(errorHandler_1.default);
    exports.app.use(noRoute_1.default);
};
exports.default = initializeHttp;
