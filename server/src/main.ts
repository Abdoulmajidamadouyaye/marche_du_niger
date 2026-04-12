import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

function deriveAllowedOrigins(clientUrl?: string): string[] {
  if (!clientUrl) return [];

  try {
    const parsed = new URL(clientUrl);
    const origins = new Set<string>([parsed.origin]);

    // Allow both apex and www domains to avoid CORS issues when domain redirects differ.
    if (parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
      if (parsed.hostname.startsWith('www.')) {
        origins.add(`${parsed.protocol}//${parsed.hostname.slice(4)}`);
      } else {
        origins.add(`${parsed.protocol}//www.${parsed.hostname}`);
      }
    }

    return Array.from(origins);
  } catch {
    console.warn('[config] CLIENT_URL is not a valid URL. Using raw value for CORS allowlist.');
    return [clientUrl];
  }
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const clientUrl = configService.get<string>('CLIENT_URL');
  const jwtSecret = configService.get<string>('JWT_SECRET');
  const adminEmail = configService.get<string>('ADMIN_EMAIL');
  const adminPassword = configService.get<string>('ADMIN_PASSWORD');

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

  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MARCHÉ DU NIGER API')
    .setDescription('API backend NestJS pour la boutique et le panneau administrateur')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}

bootstrap();
