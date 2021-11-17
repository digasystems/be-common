import express, { Router } from "express";
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import errorHandler from "./middlewares/errorHandler";
import noRoute from "./middlewares/noRoute";
import { parseIp, successResponse } from "./utils/functions";
import logger from "./logger";
import constants from "./constants";

const env = process.env.NODE_ENV || "development";

export const app = express();

export type RouterItem = {
    router: Router,
    middlewares?: any[],
}

const initializeHttp = ({ httpPort, routers }: { httpPort: number, routers: RouterItem[] }) => {
    app.use((req, res, next) => {
        logger.info(`CALL ${req.url} from ${parseIp(req)}`)
        next();
    });
    app.use(cors());
    app.use(express.json({ limit: "100mb" }));

    app.all('/', (req, res) => successResponse(req, res, process.env.APP_NAME));
    routers.forEach((r) => {
        app.use(...(r.middlewares || []), r.router);
    })
    app.use(errorHandler);
    app.use(noRoute);

    if (env === "production") {
        app.use(compression());
        app.use(helmet());
    }

    app.listen(httpPort, () => {
        logger.info(` # Listening http requests on port ${httpPort}`)
        logger.info("base path is ", constants.basePath)
    })

}

export default initializeHttp;