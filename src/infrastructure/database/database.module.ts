import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Destination } from './entities/destination.entity'; // Import Destination entity
import { UserGateway } from './gateways/user.gateway';
import { DestinationGateway } from './gateways/destination.gateway'; // Import DestinationGateway

@Module({
  imports: [TypeOrmModule.forFeature([User, Destination])], // Add Destination entity here
  providers: [UserGateway, DestinationGateway], // Add DestinationGateway here
  exports: [TypeOrmModule, UserGateway, DestinationGateway], // Export DestinationGateway here
})
export class DatabaseModule {}
