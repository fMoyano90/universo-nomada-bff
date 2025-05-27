import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Destination } from './entities/destination.entity';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { ItineraryDetail } from './entities/itinerary-detail.entity';
import { Include } from './entities/include.entity';
import { Exclude } from './entities/exclude.entity';
import { Tip } from './entities/tip.entity';
import { Faq } from './entities/faq.entity';
import { GalleryImage } from './entities/gallery-image.entity';
import { UserGateway } from './gateways/user.gateway';
import { DestinationGateway } from './gateways/destination.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Destination,
      ItineraryItem,
      ItineraryDetail,
      Include,
      Exclude,
      Tip,
      Faq,
      GalleryImage,
    ]),
  ],
  providers: [UserGateway, DestinationGateway],
  exports: [TypeOrmModule, UserGateway, DestinationGateway],
})
export class DatabaseModule {}
