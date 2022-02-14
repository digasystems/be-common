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
    else ssl.active = true;

    if (ssl?.active) {
        try {
            let check = false;
            if (fs.existsSync(path.join(process.cwd(), './key.pem'))) {
                check = true;
                options.key = fs.readFileSync(path.join(process.cwd(), './key.pem'));
            }
            if (fs.existsSync(path.join(process.cwd(), './cert.pem'))) {
                check = true;
                options.cert = fs.readFileSync(path.join(process.cwd(), './cert.pem'));
            }
            if (fs.existsSync(path.join(process.cwd(), './cert.pfx'))) {
                check = true;
                options.pfx = fs.readFileSync(path.join(process.cwd(), './cert.pfx'));
            }
            options.passphrase = ssl?.passphrase;
            if (!check) throw Error("No certificate found! Expected locations: ./cert.pfx, ./cert.pem', ./key.pem'")

            mainLogger.info("Certificato SSL ok");
            mainLogger.info(path.join(process.cwd(), './cert.pfx'));

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

