import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  TestimonialGateway,
  TESTIMONIAL_GATEWAY,
} from '../../../domain/gateways/testimonial.gateway';
import { Testimonial } from '../../../infrastructure/database/entities/testimonial.entity';

@Injectable()
export class FindTestimonialByIdInteractor {
  constructor(
    @Inject(TESTIMONIAL_GATEWAY)
    private readonly testimonialGateway: TestimonialGateway,
  ) {}

  async execute(id: number): Promise<Testimonial> {
    const testimonial = await this.testimonialGateway.findById(id);
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    // Potential business logic after fetching can go here
    return testimonial;
  }
}
