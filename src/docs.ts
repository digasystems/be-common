import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export default function initializeDocs(app, { title, version, apis }) {
    const swaggerJsdocOptions: swaggerJsdoc.Options = {
        definition: {
            openapi: '3.0.0',
            info: { title, version, },
        },
        apis: [...apis], // files containing annotations as above
    };

    const swaggerUioptions: swaggerUi.SwaggerUiOptions = {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
            persistAuthorization: true,
        }
    }

    const openapiSpecification = swaggerJsdoc(swaggerJsdocOptions);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification, swaggerUioptions));
}