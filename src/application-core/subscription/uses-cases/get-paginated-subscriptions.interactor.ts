import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionGateway } from '../../../infrastructure/database/gateways/subscription.gateway';
import { PaginatedSubscriptionsResponseDTO } from '../dto/subscription.dto';

@Injectable()
export class GetPaginatedSubscriptionsInteractor {
  constructor(
    @Inject(SubscriptionGateway)
    private readonly subscriptionGateway: SubscriptionGateway,
  ) {}

  async execute(
    page: number,
    limit: number,
    isActive?: boolean,
  ): Promise<PaginatedSubscriptionsResponseDTO> {
    return this.subscriptionGateway.findAll(page, limit, isActive);
  }
}
