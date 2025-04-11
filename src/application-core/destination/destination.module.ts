import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destination } from '../../infrastructure/database/entities/destination.entity';
import { ItineraryItem } from '../../infrastructure/database/entities/itinerary-item.entity';
import { ItineraryDetail } from '../../infrastructure/database/entities/itinerary-detail.entity';
import { Include } from '../../infrastructure/database/entities/include.entity';
import { Exclude } from '../../infrastructure/database/entities/exclude.entity';
import { Tip } from '../../infrastructure/database/entities/tip.entity';
import { Faq } from '../../infrastructure/database/entities/faq.entity';
import { GalleryImage } from '../../infrastructure/database/entities/gallery-image.entity';
import { DestinationGateway } from '../../infrastructure/database/gateways/destination.gateway';
import { CreateDestinationInteractor } from './uses-cases/create-destination.interactor';
import { DestinationController } from '../../user-interface/controllers/destination.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
  providers: [
    DestinationGateway,
    CreateDestinationInteractor,
    // Add other interactors/services here
  ],
  controllers: [DestinationController],
  exports: [
    CreateDestinationInteractor, // Export interactors for use in controllers
    // Export gateway if needed elsewhere, though usually interactors are the public API
  ],
})
export class DestinationModule {}
