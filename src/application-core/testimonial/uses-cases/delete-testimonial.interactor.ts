import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  TestimonialGateway,
  TESTIMONIAL_GATEWAY,
} from '../../../domain/gateways/testimonial.gateway';

@Injectable()
export class DeleteTestimonialInteractor {
  constructor(
    @Inject(TESTIMONIAL_GATEWAY)
    private readonly testimonialGateway: TestimonialGateway,
  ) {}

  async execute(id: number): Promise<void> {
    const deleted = await this.testimonialGateway.delete(id);
    if (!deleted) {
      // Throw an exception if the delete operation didn't affect any rows
      throw new NotFoundException(
        `Testimonial with ID ${id} not found or could not be deleted.`,
      );
    }
    // No return value needed for a successful deletion
  }
}
