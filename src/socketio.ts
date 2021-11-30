import { Server as SocketServer } from "socket.io";
import { loggers } from ".";
import { Tail } from "tail";
import fs from "fs";
import path from "path";
import _ from "lodash"

export const io = new SocketServer();

export default function initializeSocketIO({ httpServer }) {
    io.attach(httpServer, {
        cors: {
            methods: ["OPTIONS", "GET", "HEAD", "POST"],
        }
    });

    io.on('connection', function (client) {
        client.join("LOGS");

        const files = fs.readdirSync(path.join(process.cwd(), "./logs/"));
        const grouped = _.groupBy(files, (v) => {
            if (!v.includes(".log")) return "";
            let name = "";
            if (v.includes("queries")) name = "queries";
            else if (v.includes("combined")) name = "combined";
            else if (v.includes("actions")) name = "actions";
            // else if (v.includes("imports")) name = "imports";
            return name;
        })

        const sendFile = (file) => {
            try {
                const fileName = path.join(process.cwd(), "./logs/" + file);
                client.emit("logMessage", { filename: fileName });

                let tail = new Tail(fileName, { separator: /[\r]{0,1}\n/, fromBeginning: false, fsWatchOptions: {}, follow: true, nLines: 100, useWatchFile: true });
                tail.on("line", function (data) {
                    client.emit("logMessage", { tail: data.toString('utf-8'), filename: fileName })
                });

                tail.on("error", function (error) {
                    console.log('ERROR: ', error);
                    tail.unwatch()
                });
            } catch (e) {
                loggers.mainLogger.error("cant read file")
            }
        }

        Object.entries(grouped).forEach(([k, v], i) => {
            if (k) sendFile(v[v.length - 1]);
        });

    });
}