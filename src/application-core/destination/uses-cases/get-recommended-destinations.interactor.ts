import { Injectable } from '@nestjs/common';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway'; // Adjusted path
import { Destination } from '../../../infrastructure/database/entities/destination.entity'; // Adjusted path
import { DestinationType } from '../../../infrastructure/database/enums/destination-type.enum'; // Adjusted path, assuming enum exists

@Injectable()
export class GetRecommendedDestinationsInteractor {
  constructor(private readonly destinationGateway: DestinationGateway) {}

  async execute(type: DestinationType): Promise<Destination[]> {
    // Logic to fetch top 3 recommended destinations by type
    return await this.destinationGateway.findRecommendedByType(type, 3);
  }
}
