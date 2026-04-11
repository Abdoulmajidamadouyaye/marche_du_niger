import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const clientUrl = configService.get<string>('CLIENT_URL');
  const jwtSecret = configService.get<string>('JWT_SECRET');
  const adminEmail = configService.get<string>('ADMIN_EMAIL');
  const adminPassword = configService.get<string>('ADMIN_PASSWORD');

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
