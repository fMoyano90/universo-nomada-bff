import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { Subscription } from '../../infrastructure/database/entities/subscription.entity';
import { CreateSubscriptionInteractor } from './uses-cases/create-subscription.interactor';
import { DeleteSubscriptionInteractor } from './uses-cases/delete-subscription.interactor';
import { GetPaginatedSubscriptionsInteractor } from './uses-cases/get-paginated-subscriptions.interactor';
import { ToggleSubscriptionStatusInteractor } from './uses-cases/toggle-subscription-status.interactor';
import { SubscriptionGateway } from '../../infrastructure/database/gateways/subscription.gateway';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Subscription])],
  providers: [
    SubscriptionGateway,
    CreateSubscriptionInteractor,
    DeleteSubscriptionInteractor,
    GetPaginatedSubscriptionsInteractor,
    ToggleSubscriptionStatusInteractor,
  ],
  controllers: [],
  exports: [
    CreateSubscriptionInteractor,
    DeleteSubscriptionInteractor,
    GetPaginatedSubscriptionsInteractor,
    ToggleSubscriptionStatusInteractor,
  ],
})
export class SubscriptionModule {}
