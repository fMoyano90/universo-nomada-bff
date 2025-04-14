import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from '../../infrastructure/database/entities/testimonial.entity';
import { DatabaseModule } from '../../infrastructure/database/database.module'; // Import DatabaseModule to provide the gateway
import { TESTIMONIAL_GATEWAY } from '../../domain/gateways/testimonial.gateway';
import { TestimonialDbGateway } from '../../infrastructure/database/gateways/testimonial.gateway'; // Import the implementation

// Import Use Cases (Interactors) - Will be created next
import { CreateTestimonialInteractor } from './uses-cases/create-testimonial.interactor';
import { FindAllTestimonialsInteractor } from './uses-cases/find-all-testimonials.interactor';
import { FindTestimonialByIdInteractor } from './uses-cases/find-testimonial-by-id.interactor';
import { UpdateTestimonialInteractor } from './uses-cases/update-testimonial.interactor';
import { DeleteTestimonialInteractor } from './uses-cases/delete-testimonial.interactor';
import { FindLatestTestimonialsInteractor } from './uses-cases/find-latest-testimonials.interactor';

// Import Controller - Will be created later
// import { TestimonialController } from '../../user-interface/controllers/testimonial.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Testimonial]), // Register Testimonial entity
    DatabaseModule, // Make gateway implementation available
  ],
  providers: [
    // Provide the gateway implementation
    {
      provide: TESTIMONIAL_GATEWAY,
      useClass: TestimonialDbGateway,
    },
    // Register Use Cases (Interactors)
    CreateTestimonialInteractor,
    FindAllTestimonialsInteractor,
    FindTestimonialByIdInteractor,
    UpdateTestimonialInteractor,
    DeleteTestimonialInteractor,
    FindLatestTestimonialsInteractor,
  ],
  // controllers: [TestimonialController], // Controller will be added later
  exports: [
    // Export interactors for use in the controller/UI layer
    CreateTestimonialInteractor,
    FindAllTestimonialsInteractor,
    FindTestimonialByIdInteractor,
    UpdateTestimonialInteractor,
    DeleteTestimonialInteractor,
    FindLatestTestimonialsInteractor,
    TESTIMONIAL_GATEWAY, // Export gateway token if needed elsewhere
  ],
})
export class TestimonialModule {}
