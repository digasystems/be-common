"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
function initializeDocs(app, { title, version, apis }) {
    const swaggerJsdocOptions = {
        definition: {
            openapi: '3.0.0',
            info: { title, version, },
        },
        apis: [...apis],
    };
    const swaggerUioptions = {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
            persistAuthorization: true,
        }
    };
    const openapiSpecification = (0, swagger_jsdoc_1.default)(swaggerJsdocOptions);
    app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapiSpecification, swaggerUioptions));
}
exports.default = initializeDocs;
