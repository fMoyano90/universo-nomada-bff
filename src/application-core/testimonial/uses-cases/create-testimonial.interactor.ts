import { Injectable, Inject } from '@nestjs/common';
import {
  TestimonialGateway,
  TESTIMONIAL_GATEWAY,
} from '../../../domain/gateways/testimonial.gateway';
import { CreateTestimonialDto } from '../dto/testimonial.dto';
import { Testimonial } from '../../../infrastructure/database/entities/testimonial.entity';

@Injectable()
export class CreateTestimonialInteractor {
  constructor(
    @Inject(TESTIMONIAL_GATEWAY)
    private readonly testimonialGateway: TestimonialGateway,
  ) {}

  async execute(
    createTestimonialDto: CreateTestimonialDto,
  ): Promise<Testimonial> {
    // Potential business logic before creation can go here
    // For example, validating certain fields, checking for duplicates if needed, etc.
    return this.testimonialGateway.create(createTestimonialDto);
  }
}
