import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const rotateCombinedLogsOptions = { filename: (path.join(process.cwd(), "./logs/") + "combined-%DATE%.log"), datePattern: 'YYYY-MM-DD-HH', maxSize: '20m', maxFiles: '14d' }
const rotateActionsLogsOptions = { filename: (path.join(process.cwd(), "./logs/") + "actions-%DATE%.log"), datePattern: 'YYYY-MM-DD-HH', maxSize: '20m', maxFiles: '14d' }
const rotateImportsLogsOptions = { filename: (path.join(process.cwd(), "./logs/") + "imports-%DATE%.log"), datePattern: 'YYYY-MM-DD-HH', maxSize: '20m', maxFiles: '14d' }
const rotateQueriesLogsOptions = { filename: (path.join(process.cwd(), "./logs/") + "queries-%DATE%.log"), datePattern: 'YYYY-MM-DD-HH', maxSize: '20m', maxFiles: '14d' }

export const mainLogger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.align(),
        format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`)
    ),
    transports: [
        //new DailyRotateFile(rotateErrorLogsOptions),
        new DailyRotateFile(rotateCombinedLogsOptions),
    ],
});

export const importsLogger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.align(),
        format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`)
    ),
    transports: [
        new DailyRotateFile(rotateImportsLogsOptions),
    ],
});

export const actionsLogger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.align(),
        format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`)
    ),
    transports: [
        new DailyRotateFile(rotateActionsLogsOptions),
        new transports.Console()
    ],
});

export const queriesLogger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.align(),
        format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`)
    ),
    transports: [
        new DailyRotateFile(rotateQueriesLogsOptions),
    ],
});

if (process?.env?.NODE_ENV !== "production") {
    mainLogger.add(new transports.Console());
    importsLogger.add(new transports.Console());
}