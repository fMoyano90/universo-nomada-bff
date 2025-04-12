import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());

  // Enable CORS with configuration from .env
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS')
    ?.split(',') || ['http://localhost:5173'];
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Global pipes, filters and interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Universo Nómada API')
      .setDescription('API para el sistema Universo Nómada')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Start server
  const port = configService.get<number>('PORT', 3000);
  const environment = configService.get<string>('NODE_ENV', 'development');
  await app.listen(port);

  const separator = '='.repeat(60);
  logger.log(separator);
  logger.log('');
  logger.log(`🚀 Servidor iniciado en modo: ${environment.toUpperCase()}`);
  logger.log(`📡 Servidor escuchando en: http://localhost:${port}`);
  logger.log(`🛠️  API Base URL: http://localhost:${port}/api/v1`);
  if (environment !== 'production') {
    logger.log(`📚 Documentación API: http://localhost:${port}/api/docs`);
  }
  logger.log(`🌐 CORS habilitado para:`);
  allowedOrigins.forEach((origin) => logger.log(`   - ${origin}`));
  logger.log('');
  logger.log(separator);
}
bootstrap();
