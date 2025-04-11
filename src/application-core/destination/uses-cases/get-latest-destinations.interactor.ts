import { Inject, Injectable } from '@nestjs/common';
import { Destination } from '../../../infrastructure/database/entities/destination.entity';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway';

@Injectable()
export class GetLatestDestinationsInteractor {
  constructor(
    @Inject(DestinationGateway)
    private readonly destinationGateway: DestinationGateway,
  ) {}

  async execute(limit: number): Promise<Destination[]> {
    return this.destinationGateway.findLatest(limit);
  }
}
