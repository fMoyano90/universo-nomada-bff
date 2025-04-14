import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  TestimonialGateway,
  TESTIMONIAL_GATEWAY,
} from '../../../domain/gateways/testimonial.gateway';
import { UpdateTestimonialDto } from '../dto/testimonial.dto';
import { Testimonial } from '../../../infrastructure/database/entities/testimonial.entity';

@Injectable()
export class UpdateTestimonialInteractor {
  constructor(
    @Inject(TESTIMONIAL_GATEWAY)
    private readonly testimonialGateway: TestimonialGateway,
  ) {}

  async execute(
    id: number,
    updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<Testimonial> {
    // The gateway's update method already handles finding the entity first
    // and merging. We just need to handle the case where it returns null (not found).
    const updatedTestimonial = await this.testimonialGateway.update(
      id,
      updateTestimonialDto,
    );

    if (!updatedTestimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    // Potential business logic after update can go here
    return updatedTestimonial;
  }
}
