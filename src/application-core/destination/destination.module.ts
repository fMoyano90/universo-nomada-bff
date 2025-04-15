import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module'; // Import InfrastructureModule
import { DatabaseModule } from '../../infrastructure/database/database.module'; // Import DatabaseModule
import { Destination } from '../../infrastructure/database/entities/destination.entity';
import { ItineraryItem } from '../../infrastructure/database/entities/itinerary-item.entity';
import { ItineraryDetail } from '../../infrastructure/database/entities/itinerary-detail.entity';
import { Include } from '../../infrastructure/database/entities/include.entity';
import { Exclude } from '../../infrastructure/database/entities/exclude.entity';
import { Tip } from '../../infrastructure/database/entities/tip.entity';
import { Faq } from '../../infrastructure/database/entities/faq.entity';
import { GalleryImage } from '../../infrastructure/database/entities/gallery-image.entity';
import { DestinationGateway } from '../../infrastructure/database/gateways/destination.gateway';
// DestinationGateway is provided by DatabaseModule, no need to import it directly here
import { CreateDestinationInteractor } from './uses-cases/create-destination.interactor';
import { UpdateDestinationInteractor } from './uses-cases/update-destination.interactor';
import { DeleteDestinationInteractor } from './uses-cases/delete-destination.interactor';
import { GetLatestSpecialDestinationInteractor } from './uses-cases/get-latest-special-destination.interactor'; // Import GetLatestSpecial Interactor
import { GetRecommendedDestinationsInteractor } from './uses-cases/get-recommended-destinations.interactor'; // Import GetRecommended Interactor
import { GetPaginatedDestinationsByTypeInteractor } from './uses-cases/get-paginated-destinations-by-type.interactor'; // Import GetPaginated Interactor
import { GetLatestDestinationsInteractor } from './uses-cases/get-latest-destinations.interactor';
import { GetDestinationByIdInteractor } from './uses-cases/get-destination-by-id.interactor';
import { GetAllPaginatedDestinationsInteractor } from './uses-cases/get-all-paginated-destinations.interactor'; // Import el nuevo interactor

@Module({
  imports: [
    InfrastructureModule, // Provides services like AzureStorageService
    DatabaseModule, // Provides DestinationGateway
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
    UpdateDestinationInteractor,
    DeleteDestinationInteractor,
    GetLatestSpecialDestinationInteractor, // Add GetLatestSpecial Interactor
    GetRecommendedDestinationsInteractor, // Add GetRecommended Interactor
    GetPaginatedDestinationsByTypeInteractor, // Add GetPaginated Interactor
    GetLatestDestinationsInteractor,
    GetDestinationByIdInteractor,
    GetAllPaginatedDestinationsInteractor, // Añadir el nuevo interactor aquí
    // Add other interactors/services here
  ],
  controllers: [],
  exports: [
    CreateDestinationInteractor, // Export interactors for use in controllers
    UpdateDestinationInteractor,
    DeleteDestinationInteractor,
    GetLatestSpecialDestinationInteractor, // Export GetLatestSpecial Interactor
    GetRecommendedDestinationsInteractor, // Export GetRecommended Interactor
    GetPaginatedDestinationsByTypeInteractor, // Export GetPaginated Interactor
    GetLatestDestinationsInteractor,
    GetDestinationByIdInteractor,
    GetAllPaginatedDestinationsInteractor, // Exportar el nuevo interactor aquí
    // Export gateway if needed elsewhere, though usually interactors are the public API
  ],
})
export class DestinationModule {}
