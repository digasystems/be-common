import constants from "./constants";
import initializeHttp, { app, RouterItem } from "./express";
import * as loggers from "./logger";
import { mainLogger } from "./logger";
import initializeSocketIO, { io } from "./socketio";
import * as functions from "./utils/functions";
import Mailer from "./utils/mailer/index";


const initialize = ({ httpPort, routers, ssl, docs }: { httpPort: number, routers: RouterItem[], ssl: any, docs?: any }) => {
    const httpServer = (ssl?.active ? require('https') : require('http')).createServer(app);

    initializeHttp({ httpPort, routers, httpServer, docs });
    initializeSocketIO({ httpServer });

    httpServer.listen(httpPort, () => {
        mainLogger.info(`Listening http requests on port ${httpPort}`)
    })
}

export { initialize, app, loggers, functions, Mailer, constants, io };

