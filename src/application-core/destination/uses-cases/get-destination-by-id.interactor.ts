import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway';
import { Destination } from '../../../infrastructure/database/entities/destination.entity';

@Injectable()
export class GetDestinationByIdInteractor {
  constructor(
    @Inject(DestinationGateway)
    private readonly destinationGateway: DestinationGateway,
  ) {}

  async execute(id: number): Promise<Destination> {
    const destination = await this.destinationGateway.findById(id);

    if (!destination) {
      throw new NotFoundException(`Destino con ID ${id} no encontrado`);
    }

    return destination;
  }
}
