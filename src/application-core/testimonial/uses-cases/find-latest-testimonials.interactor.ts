import { Injectable, Inject } from '@nestjs/common';
import {
  TestimonialGateway,
  TESTIMONIAL_GATEWAY,
} from '../../../domain/gateways/testimonial.gateway';
import { Testimonial } from '../../../infrastructure/database/entities/testimonial.entity';

@Injectable()
export class FindLatestTestimonialsInteractor {
  constructor(
    @Inject(TESTIMONIAL_GATEWAY)
    private readonly testimonialGateway: TestimonialGateway,
  ) {}

  async execute(limit = 6): Promise<Testimonial[]> {
    // Removed redundant type annotation
    // Default limit to 6 if not provided, matching the frontend example
    if (limit <= 0) {
      limit = 6; // Ensure limit is positive
    }
    return this.testimonialGateway.findLatest(limit);
  }
}
