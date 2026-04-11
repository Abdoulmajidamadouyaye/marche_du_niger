"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 4000);
    const clientUrl = configService.get('CLIENT_URL');
    const jwtSecret = configService.get('JWT_SECRET');
    const adminEmail = configService.get('ADMIN_EMAIL');
    const adminPassword = configService.get('ADMIN_PASSWORD');
    if (!clientUrl) {
        throw new Error('CLIENT_URL environment variable is required');
    }
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    if (!adminEmail || !adminPassword) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    }
    const localOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    const allowedOrigins = Array.from(new Set([clientUrl, ...localOrigins]));
    app.use((0, express_1.json)({ limit: '5mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '5mb' }));
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('MARCHÉ DU NIGER API')
        .setDescription('API backend NestJS pour la boutique et le panneau administrateur')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map