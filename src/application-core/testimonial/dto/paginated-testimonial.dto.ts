import { ApiProperty } from '@nestjs/swagger';
import { TestimonialResponseDto } from './testimonial.dto';

// Helper class for Swagger documentation of paginated results
export class PaginatedTestimonialResponseDto {
  @ApiProperty({ type: [TestimonialResponseDto] })
  data: TestimonialResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}
