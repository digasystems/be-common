import express, { Router } from "express";
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import errorHandler from "./middlewares/errorHandler";
import noRoute from "./middlewares/noRoute";
import { parseIp, successResponse } from "./utils/functions";
import { mainLogger } from "./logger";
import path from "path";
import initializeDocs from "./docs";


const env = process.env.NODE_ENV || "development";

export const app = express();

export type RouterItem = {
    router: Router,
    middlewares?: any[],
}

const initializeHttp = ({ httpPort, routers, httpServer, docs }: { httpPort: number, routers: RouterItem[], httpServer: any, docs: any }) => {
    if (env === "production") {
        app.use(compression());
        app.use(helmet());
    }

    app.use(cors());
    app.use(express.json({ limit: "100mb" }));
    app.use((req, res, next) => {
        mainLogger.info(`CALL ${req.url} from ${parseIp(req)}`)
        next();
    });

    /**
     * @openapi
     * /:
     *   get:
     *     description: Api main endpoint
     *     responses:
     *       200:
     *         description: Returns a success repsonse
     */
    app.all('/', (req, res) => successResponse(req, res, process.env.APP_NAME + " " + docs?.version));

    app.use('/logs', express.static(path.join(__dirname, "./assets/html/")));
    initializeDocs(app, { title: docs?.title || "test-title", version: docs?.version || "1.0.0", apis: docs.apis })

    routers.forEach((r) => {
        app.use(...(r.middlewares || []), r.router);
    })
    app.use(errorHandler);
    app.use(noRoute);

    /* app.listen(httpPort, () => {
        mainLogger.info(`Listening http requests on port ${httpPort}`)
    }) */

}

export default initializeHttp;