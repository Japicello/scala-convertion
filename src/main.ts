import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Prevents breaking Swagger UI inline assets
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Enable CORS for mobile apps, emulators, and external origins
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    exposedHeaders: 'Content-Disposition, Content-Length',
  });

  // Global prefix for API endpoints (excluding health and root)
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', '', 'docs', 'docs-json'],
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  // Global Exception Filter for predictable JSON errors
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Setup OpenAPI / Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ScalaDocs Enterprise Document Engine API')
    .setDescription(
      'API REST para servicios de conversión a PDF, escáner OCR, Kardex Valorado oficial (SUNAT 13.1 / NIIF 2), Kardex de enfermería, autenticación corporativa JWT y sistema de donaciones.',
    )
    .setVersion('4.2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce el token JWT obtenido en /auth/login o /auth/register',
      },
      'bearer',
    )
    .addTag('Autenticación', 'Registro, inicio de sesión corporativo y perfil de usuario')
    .addTag('Kardex de Inventario & Formatos', 'Cálculo de Kardex Valorado (Promedio, PEPS, UEPS) y exportación oficial a PDF')
    .addTag('Kardex de Enfermería', 'Diagnóstico PAE, ficha clínica y exportación oficial de Kárdex para Venezuela')
    .addTag('Conversions', 'Conversión segura de archivos a PDF')
    .addTag('Documentos e Historial', 'Historial reciente de documentos y métricas del motor')
    .addTag('Donaciones', 'Canales y niveles de apoyo para el mantenimiento de ScalaDocs')
    .addTag('Health', 'Estado del sistema y monitoreo')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'ScalaDocs API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 ScalaDocs API running on: http://localhost:${port}`);
  logger.log(`📚 Swagger UI documentation available at: http://localhost:${port}/docs`);
  logger.log(`📋 Health check available at: http://localhost:${port}/health`);
  logger.log(`📄 Convert endpoint at: http://localhost:${port}/api/v1/converter/to-pdf`);
}

void bootstrap();
