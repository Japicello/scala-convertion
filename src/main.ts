import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
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

  // Global Exception Filter for predictable JSON errors
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Setup OpenAPI / Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('File Converter API')
    .setDescription(
      'API REST de conversión de imágenes y documentos a PDF orientada a aplicaciones móviles. Diseñada con principios SOLID, validación por Magic Bytes y protección de recursos.',
    )
    .setVersion('1.0.0')
    .addTag('Conversions', 'Conversión segura de archivos a PDF')
    .addTag('Health', 'Estado del sistema y monitoreo')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'File Converter API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 File Converter API running on: http://localhost:${port}`);
  logger.log(`📚 Swagger UI documentation available at: http://localhost:${port}/docs`);
  logger.log(`📋 Health check available at: http://localhost:${port}/health`);
  logger.log(`📄 Convert endpoint at: http://localhost:${port}/api/v1/converter/to-pdf`);
}

void bootstrap();
