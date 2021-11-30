"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const socket_io_1 = require("socket.io");
const _1 = require(".");
const tail_1 = require("tail");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
exports.io = new socket_io_1.Server();
function initializeSocketIO({ httpServer }) {
    exports.io.attach(httpServer, {
        cors: {
            methods: ["OPTIONS", "GET", "HEAD", "POST"],
        }
    });
    exports.io.on('connection', function (client) {
        client.join("LOGS");
        const files = fs_1.default.readdirSync(path_1.default.join(process.cwd(), "./logs/"));
        const grouped = lodash_1.default.groupBy(files, (v) => {
            if (!v.includes(".log"))
                return "";
            let name = "";
            if (v.includes("queries"))
                name = "queries";
            else if (v.includes("combined"))
                name = "combined";
            else if (v.includes("actions"))
                name = "actions";
            return name;
        });
        const sendFile = (file) => {
            try {
                const fileName = path_1.default.join(process.cwd(), "./logs/" + file);
                client.emit("logMessage", { filename: fileName });
                let tail = new tail_1.Tail(fileName, { separator: /[\r]{0,1}\n/, fromBeginning: false, fsWatchOptions: {}, follow: true, nLines: 100, useWatchFile: true });
                tail.on("line", function (data) {
                    client.emit("logMessage", { tail: data.toString('utf-8'), filename: fileName });
                });
                tail.on("error", function (error) {
                    console.log('ERROR: ', error);
                    tail.unwatch();
                });
            }
            catch (e) {
                _1.loggers.mainLogger.error("cant read file");
            }
        };
        Object.entries(grouped).forEach(([k, v], i) => {
            if (k)
                sendFile(v[v.length - 1]);
        });
    });
}
exports.default = initializeSocketIO;
