import { Injectable, Inject } from '@nestjs/common';
import {
  TestimonialGateway,
  TESTIMONIAL_GATEWAY,
} from '../../../domain/gateways/testimonial.gateway';
import { Testimonial } from '../../../infrastructure/database/entities/testimonial.entity';
import {
  PaginationOptions,
  PaginationResult,
} from '../../../common/interfaces/pagination.interface';

@Injectable()
export class FindAllTestimonialsInteractor {
  constructor(
    @Inject(TESTIMONIAL_GATEWAY)
    private readonly testimonialGateway: TestimonialGateway,
  ) {}

  async execute(
    options: PaginationOptions,
  ): Promise<PaginationResult<Testimonial>> {
    // Potential business logic before fetching can go here
    // e.g., setting default pagination if not provided
    const defaultOptions: PaginationOptions = {
      page: 1,
      limit: 10,
      sortBy: 'created_at',
      sortOrder: 'DESC',
      ...options, // Override defaults with provided options
    };
    return this.testimonialGateway.findAll(defaultOptions);
  }
}
