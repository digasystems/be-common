import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

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
    }

    const openapiSpecification = swaggerJsdoc(swaggerJsdocOptions);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification, swaggerUioptions));
}