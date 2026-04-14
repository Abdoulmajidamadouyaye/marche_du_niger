"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
const app_module_1 = require("./app.module");
function deriveAllowedOrigins(clientUrl) {
    if (!clientUrl)
        return [];
    try {
        const parsed = new URL(clientUrl);
        const origins = new Set([parsed.origin]);
        if (parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
            if (parsed.hostname.startsWith('www.')) {
                origins.add(`${parsed.protocol}//${parsed.hostname.slice(4)}`);
            }
            else {
                origins.add(`${parsed.protocol}//www.${parsed.hostname}`);
            }
        }
        return Array.from(origins);
    }
    catch {
        console.warn('[config] CLIENT_URL is not a valid URL. Using raw value for CORS allowlist.');
        return [clientUrl];
    }
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 4000);
    const clientUrl = configService.get('CLIENT_URL');
    const jwtSecret = configService.get('JWT_SECRET');
    const adminEmail = configService.get('ADMIN_EMAIL');
    const adminPassword = configService.get('ADMIN_PASSWORD');
    if (!clientUrl) {
        console.warn('[config] CLIENT_URL is not set. Only localhost origins are allowed for now.');
    }
    if (!jwtSecret) {
        console.warn('[config] JWT_SECRET is not set. Falling back to default secret.');
    }
    if (!adminEmail || !adminPassword) {
        console.warn('[config] ADMIN_EMAIL or ADMIN_PASSWORD is not set. Admin login will fail until configured.');
    }
    const localOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    const allowedOrigins = Array.from(new Set([...deriveAllowedOrigins(clientUrl), ...localOrigins]));
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