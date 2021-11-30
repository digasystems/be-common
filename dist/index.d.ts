import constants from "./constants";
import { app, RouterItem } from "./express";
import * as loggers from "./logger";
import { io } from "./socketio";
import * as functions from "./utils/functions";
import Mailer from "./utils/mailer/index";
declare const initialize: ({ httpPort, routers, ssl, docs }: {
    httpPort: number;
    routers: RouterItem[];
    ssl: any;
    docs?: any;
}) => void;
export { initialize, app, loggers, functions, Mailer, constants, io };
