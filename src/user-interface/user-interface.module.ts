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
import { TestimonialModule } from '../application-core/testimonial/testimonial.module'; // Import TestimonialModule
import { UploadService } from './services/upload.service'; // Importar UploadService
import { InfrastructureModule } from '../infrastructure/infrastructure.module'; // Importar InfrastructureModule

@Module({
  imports: [
    ApplicationCoreModule,
    SliderModule,
    SubscriptionModule,
    BookingModule,
    DestinationModule,
    TestimonialModule, // Add TestimonialModule here
    InfrastructureModule, // Importar InfrastructureModule para los servicios de Azure y ImageUtils
  ],
  controllers: [
    UserController,
    AuthController,
    SliderController,
    SubscriptionController,
    BookingController,
    DestinationController,
    // TestimonialController está en el TestimonialModule
  ],
  providers: [
    UploadService, // Agregar UploadService como proveedor
  ],
})
export class UserInterfaceModule {}
