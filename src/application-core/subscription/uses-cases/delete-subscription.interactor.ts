import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionGateway } from '../../../infrastructure/database/gateways/subscription.gateway';

@Injectable()
export class DeleteSubscriptionInteractor {
  constructor(
    @Inject(SubscriptionGateway)
    private readonly subscriptionGateway: SubscriptionGateway,
  ) {}

  async execute(id: number): Promise<void> {
    return this.subscriptionGateway.delete(id);
  }
}
