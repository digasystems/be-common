import constants from "./constants";
import initializeHttp, { app, RouterItem } from "./express";
import * as loggers from "./logger";
import * as functions from "./utils/functions";
import Mailer from "./utils/mailer/index";

const initialize = ({ httpPort, routers }: { httpPort: number, routers: RouterItem[] }) => {
    initializeHttp({ httpPort, routers });
}

export { initialize, app, loggers, functions, Mailer, constants };
