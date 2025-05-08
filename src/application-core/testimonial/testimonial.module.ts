import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from '../../infrastructure/database/entities/testimonial.entity';
import { TestimonialDbGateway } from '../../infrastructure/database/gateways/testimonial.gateway';
import { TESTIMONIAL_GATEWAY } from '../../domain/gateways/testimonial.gateway';
import { CreateTestimonialInteractor } from './uses-cases/create-testimonial.interactor';
import { FindAllTestimonialsInteractor } from './uses-cases/find-all-testimonials.interactor';
import { FindTestimonialByIdInteractor } from './uses-cases/find-testimonial-by-id.interactor';
import { UpdateTestimonialInteractor } from './uses-cases/update-testimonial.interactor';
import { DeleteTestimonialInteractor } from './uses-cases/delete-testimonial.interactor';
import { FindLatestTestimonialsInteractor } from './uses-cases/find-latest-testimonials.interactor';
import { TestimonialController } from '../../user-interface/controllers/testimonial.controller';
import { UploadService } from '../../user-interface/services/upload.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial]), InfrastructureModule],
  controllers: [TestimonialController],
  providers: [
    // Interactors (Use Cases)
    CreateTestimonialInteractor,
    FindAllTestimonialsInteractor,
    FindTestimonialByIdInteractor,
    UpdateTestimonialInteractor,
    DeleteTestimonialInteractor,
    FindLatestTestimonialsInteractor,

    // Gateway provider con token adecuado
    {
      provide: TESTIMONIAL_GATEWAY,
      useClass: TestimonialDbGateway,
    },

    // Servicios necesarios
    UploadService,
  ],
  exports: [
    // Export interactors for potential use in other modules
    CreateTestimonialInteractor,
    FindAllTestimonialsInteractor,
    FindTestimonialByIdInteractor,
    UpdateTestimonialInteractor,
    DeleteTestimonialInteractor,
    FindLatestTestimonialsInteractor,
    // Exportar el gateway con su token
    {
      provide: TESTIMONIAL_GATEWAY,
      useClass: TestimonialDbGateway,
    },
  ],
})
export class TestimonialModule {}
