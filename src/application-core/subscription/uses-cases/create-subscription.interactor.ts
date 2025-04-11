import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionGateway } from '../../../infrastructure/database/gateways/subscription.gateway';
import { CreateSubscriptionRequestDTO } from '../dto/subscription.dto';
import { Subscription } from '../../../infrastructure/database/entities/subscription.entity';

@Injectable()
export class CreateSubscriptionInteractor {
  constructor(
    @Inject(SubscriptionGateway)
    private readonly subscriptionGateway: SubscriptionGateway,
  ) {}

  async execute(dto: CreateSubscriptionRequestDTO): Promise<Subscription> {
    return this.subscriptionGateway.create(dto.email);
  }
}
