import { Injectable, Logger } from '@nestjs/common';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway';
import {
  CreateDestinationRequestDTO,
  DestinationResponseDTO,
} from '../dto/destination.dto'; // Adjust path if needed
import { Destination } from '../../../infrastructure/database/entities/destination.entity';

@Injectable()
export class CreateDestinationInteractor {
  private readonly logger = new Logger(CreateDestinationInteractor.name);

  constructor(private readonly destinationGateway: DestinationGateway) {}

  async execute(createDto: CreateDestinationRequestDTO): Promise<Destination> {
    // Returning the full entity for now
    this.logger.log(
      `Executing CreateDestinationInteractor for: ${createDto.title}`,
    );
    try {
      // The gateway handles the mapping and saving logic
      const createdDestination = await this.destinationGateway.create(
        createDto,
      );

      this.logger.log(
        `Successfully created destination with ID: ${createdDestination.id}`,
      );

      // You could map this to DestinationResponseDTO if needed,
      // but returning the entity might be sufficient depending on controller needs.
      return createdDestination;
    } catch (error) {
      this.logger.error(
        `Failed to create destination: ${error.message}`,
        error.stack,
      );
      // Re-throw the error to be handled by global exception filters or controller
      throw error;
    }
  }
}
