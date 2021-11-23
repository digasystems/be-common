import constants from "./constants";
import { app, RouterItem } from "./express";
import { io } from "./socketio";
import * as loggers from "./logger";
import * as functions from "./utils/functions";
import Mailer from "./utils/mailer/index";
declare const initialize: ({ httpPort, routers }: {
    httpPort: number;
    routers: RouterItem[];
}) => void;
export { initialize, app, loggers, functions, Mailer, constants, io };
