import { Testimonial } from '../../infrastructure/database/entities/testimonial.entity';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from '../../application-core/testimonial/dto/testimonial.dto';
import {
  PaginationOptions,
  PaginationResult, // Corrected import name
} from '../../common/interfaces/pagination.interface';

export interface TestimonialGateway {
  create(createTestimonialDto: CreateTestimonialDto): Promise<Testimonial>;
  findAll(options: PaginationOptions): Promise<PaginationResult<Testimonial>>; // Corrected type usage
  findById(id: number): Promise<Testimonial | null>;
  update(
    id: number,
    updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<Testimonial | null>;
  delete(id: number): Promise<boolean>; // Returns true if deletion was successful
  findLatest(limit: number): Promise<Testimonial[]>; // To get latest testimonials for the frontend
}

export const TESTIMONIAL_GATEWAY = 'TestimonialGateway';
