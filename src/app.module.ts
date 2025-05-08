import { Module } from '@nestjs/common';
import { UserInterfaceModule } from './user-interface/user-interface.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
// User entity is loaded via ApplicationCoreModule -> UserModule -> TypeOrmModule.forFeature
// import { User } from './infrastructure/database/entities/user.entity';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ApplicationCoreModule } from './application-core/application-core.module';
import { DestinationModule } from './application-core/destination/destination.module';
import { SliderModule } from './application-core/slider/slider.module';
import { TestimonialModule } from './application-core/testimonial/testimonial.module'; // Import TestimonialModule
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './application-core/auth/guards/jwt-auth.guard';
import { RolesGuard } from './application-core/auth/guards/roles.guard';
import { validate } from './common/validation/env.validation';
import { I18nInterceptor } from './infrastructure/i18n/i18n.interceptor';
import { TranslationService } from './infrastructure/i18n/translation.service';
import { AuthModule } from './application-core/auth/auth.module';
import { UploadController } from './user-interface/controllers/upload.controller';
import { UploadService } from './user-interface/services/upload.service';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      validate, // Validación de variables de entorno
    }),

    // Conexión a la base de datos PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      // entities: [User], // Remove explicit entity list here; rely on autoLoadEntities and forFeature imports
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true, // This will load entities registered via forFeature
      ssl: { rejectUnauthorized: false },
      logging: process.env.NODE_ENV !== 'production',
      // Configuraciones de rendimiento
      poolSize: 10,
      connectTimeoutMS: 10000,
      maxQueryExecutionTime: 5000,
    }),

    // Servir archivos estáticos
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'assets'),
      serveRoot: '/assets',
    }),

    // Protección contra ataques de fuerza bruta
    ThrottlerModule.forRoot({
      ttl: parseInt(process.env.THROTTLE_TTL || '60'),
      limit: parseInt(process.env.THROTTLE_LIMIT || '20'),
    }),

    // Módulos de la aplicación
    InfrastructureModule,
    ApplicationCoreModule, // Contains UserModule, AuthModule, etc.
    DestinationModule,
    SliderModule,
    TestimonialModule, // Add TestimonialModule here
    UserInterfaceModule,
    AuthModule,
  ],
  controllers: [UploadController],
  providers: [
    // Guardia global para proteger todas las rutas con JWT
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guardia global para verificar roles
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Aplicar el rate limiting a nivel global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Interceptor global para transformar respuestas
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Interceptor global para logging
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Interceptor global para traducciones
    {
      provide: APP_INTERCEPTOR,
      useClass: I18nInterceptor,
    },
    // Servicio de traducción disponible a nivel global
    {
      provide: 'TranslationService',
      useExisting: TranslationService,
    },
    // Filtro global para manejo de excepciones
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    UploadService,
  ],
})
export class AppModule {
  constructor() {
    console.log(
      `Aplicación iniciada en modo: ${process.env.NODE_ENV || 'development'}`,
    );
  }
}
