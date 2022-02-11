import fs from "fs";
import path from "path";
import constants from "./constants";
import initializeHttp, { app, RouterItem } from "./express";
import * as loggers from "./logger";
import { mainLogger } from "./logger";
import initializeSocketIO, { io } from "./socketio";
import * as functions from "./utils/functions";
import Mailer from "./utils/mailer/index";

const initialize = ({ httpPort, routers, ssl, docs }: { httpPort: number, routers: RouterItem[], ssl: any, docs?: any }) => {
    const options: any = {};
    if (ssl?.active == "false") ssl.active = false;

    if (ssl?.active) {
        try {
            try {
                options.key = fs.readFileSync(path.join(process.cwd(), './key.pem'));
                options.cert = fs.readFileSync(path.join(process.cwd(), './cert.pem'));
                options.pfx = fs.readFileSync(path.join(process.cwd(), './cert.pfx'));
                options.passphrase = ssl?.passphrase;
                mainLogger.info("Certificato SSL ok");
                mainLogger.info(path.join(process.cwd(), './cert.pfx'));
            } catch (e) {
                if (!options.key && !options.cert && !options.pfx) {
                    mainLogger.error("Certificato SSL non trovato");

                    throw Error("No certificate found! Expected locations: ./cert.pfx, ./cert.pem', ./key.pem'")
                }
            }
        } catch (e) {
            mainLogger.warn(e);
            options.pfx = null;
            options.passphrase = null;
        }
    }

    const httpServer = (ssl?.active ? require('https') : require('http')).createServer(options, app);

    initializeHttp({ httpPort, routers, httpServer, docs });
    initializeSocketIO({ httpServer });

    httpServer.listen(httpPort, () => {
        mainLogger.info(`Listening http requests on port ${httpPort}`)
    })
}

export { initialize, app, loggers, functions, Mailer, constants, io };

