import { Module } from '@nestjs/common';
import { ApplicationCoreModule } from '../application-core/application-core.module';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { SliderController } from './controllers/slider.controller';
import { SliderModule } from '../application-core/slider/slider.module';
import { SubscriptionController } from './controllers/subscription.controller';
import { BookingController } from './controllers/booking.controller';
import { DestinationController } from './controllers/destination.controller';
import { SubscriptionModule } from '../application-core/subscription/subscription.module';
import { BookingModule } from '../application-core/booking/booking.module';
import { DestinationModule } from '../application-core/destination/destination.module';

@Module({
  imports: [
    ApplicationCoreModule,
    SliderModule,
    SubscriptionModule,
    BookingModule,
    DestinationModule,
  ],
  controllers: [
    UserController,
    AuthController,
    SliderController,
    SubscriptionController,
    BookingController,
    DestinationController,
  ],
  providers: [],
})
export class UserInterfaceModule {}
