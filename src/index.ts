import constants from "./constants";
import initializeHttp, { app, RouterItem } from "./express";
import logger from "./logger";

const initialize = ({ httpPort, routers }: {
    httpPort: number,
    routers: RouterItem[]
}) => {
    logger.info("base path is ", constants.basePath)
    initializeHttp({ httpPort, routers });
}



export { initialize, app, logger };
