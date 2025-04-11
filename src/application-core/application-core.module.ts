import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { services } from './services';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../infrastructure/database/database.module';

@Module({
  imports: [
    InfrastructureModule,
    DatabaseModule,
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '6d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: services,
  exports: services,
})
export class ApplicationCoreModule {}
