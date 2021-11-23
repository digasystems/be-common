"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queriesLogger = exports.actionsLogger = exports.importsLogger = exports.mainLogger = void 0;
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const rotateCombinedLogsOptions = { filename: (path_1.default.join(process.cwd(), "./logs/") + "combined-%DATE%.log"), datePattern: 'YYYY-MM-DD-HH', maxSize: '20m', maxFiles: '14d' };
const rotateActionsLogsOptions = { filename: (path_1.default.join(process.cwd(), "./logs/") + "actions-%DATE%.log"), datePattern: 'YYYY-MM-DD-HH', maxSize: '20m', maxFiles: '14d' };
const rotateImportsLogsOptions = { filename: (path_1.default.join(process.cwd(), "./logs/") + "imports-%DATE%.log"), datePattern: 'YYYY-MM-DD-HH', maxSize: '20m', maxFiles: '14d' };
const rotateQueriesLogsOptions = { filename: (path_1.default.join(process.cwd(), "./logs/") + "queries-%DATE%.log"), datePattern: 'YYYY-MM-DD-HH', maxSize: '20m', maxFiles: '14d' };
exports.mainLogger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), winston_1.format.align(), winston_1.format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`)),
    transports: [
        new winston_daily_rotate_file_1.default(rotateCombinedLogsOptions),
    ],
});
exports.importsLogger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), winston_1.format.align(), winston_1.format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`)),
    transports: [
        new winston_daily_rotate_file_1.default(rotateImportsLogsOptions),
    ],
});
exports.actionsLogger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), winston_1.format.align(), winston_1.format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`)),
    transports: [
        new winston_daily_rotate_file_1.default(rotateActionsLogsOptions),
        new winston_1.transports.Console()
    ],
});
exports.queriesLogger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), winston_1.format.align(), winston_1.format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`)),
    transports: [
        new winston_daily_rotate_file_1.default(rotateQueriesLogsOptions),
    ],
});
if (process?.env?.NODE_ENV !== "production") {
    exports.mainLogger.add(new winston_1.transports.Console());
    exports.importsLogger.add(new winston_1.transports.Console());
}
