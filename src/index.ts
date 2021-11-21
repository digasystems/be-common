import constants from "./constants";
import initializeHttp, { app, RouterItem } from "./express";
import initializeSocketIO, { io } from "./socketio";
import * as loggers from "./logger";
import * as functions from "./utils/functions";
import Mailer from "./utils/mailer/index";
import { mainLogger } from "./logger";

const httpServer = require('http').createServer(app);

const initialize = ({ httpPort, routers }: { httpPort: number, routers: RouterItem[] }) => {
    initializeHttp({ httpPort, routers, httpServer });
    initializeSocketIO({ httpServer });
    httpServer.listen(httpPort, () => {
        mainLogger.info(`Listening http requests on port ${httpPort}`)
    })
}

export { initialize, app, loggers, functions, Mailer, constants, io };
