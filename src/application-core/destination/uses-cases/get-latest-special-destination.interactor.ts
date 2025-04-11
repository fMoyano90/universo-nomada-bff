import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway';
import { Destination } from '../../../infrastructure/database/entities/destination.entity';

@Injectable()
export class GetLatestSpecialDestinationInteractor {
  private readonly logger = new Logger(
    GetLatestSpecialDestinationInteractor.name,
  );

  constructor(private readonly destinationGateway: DestinationGateway) {}

  async execute(): Promise<Destination> {
    this.logger.log('Executing GetLatestSpecialDestinationInteractor');
    const destination = await this.destinationGateway.findLatestSpecial();

    if (!destination) {
      this.logger.warn('No special destination found.');
      // Depending on requirements, you might return null or throw NotFoundException
      throw new NotFoundException('No special destination found.');
    }

    this.logger.log(
      `Found latest special destination: ${destination.title} (ID: ${destination.id})`,
    );
    return destination;
  }
}
