import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserGateway } from './gateways/user.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserGateway],
  exports: [TypeOrmModule, UserGateway],
})
export class DatabaseModule {}
