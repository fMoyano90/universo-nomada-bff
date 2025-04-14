import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({
    description: 'Name of the traveler',
    example: 'Ana García',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: "URL or path to the traveler's avatar image",
    example: '/assets/images/avatars/ana.jpg',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  // Consider adding @IsUrl() if you enforce URL format
  avatar_image_url?: string;

  @ApiProperty({
    description: 'Rating given by the traveler (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'The main text of the testimonial',
    example: '¡Una experiencia inolvidable, muy recomendado!',
  })
  @IsString()
  @IsNotEmpty()
  testimonial_text: string;

  @ApiProperty({
    description:
      'Array of URLs or paths for trip images associated with the testimonial',
    example: [
      '/assets/images/trips/atacama1.jpg',
      '/assets/images/trips/atacama2.jpg',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  // Consider adding @IsUrl({}, { each: true }) if you enforce URL format
  trip_image_urls?: string[];
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}

export class TestimonialResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the testimonial',
    example: 1,
  })
  id: number;

  @ApiProperty({ description: 'Name of the traveler', example: 'Juan Pérez' })
  name: string;

  @ApiProperty({
    description: "URL or path to the traveler's avatar image",
    example: '/assets/images/avatars/juan.jpg',
    required: false,
  })
  avatar_image_url: string;

  @ApiProperty({
    description: 'Rating given by the traveler (1-5)',
    example: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'The main text of the testimonial',
    example: '¡Un viaje increíble!',
  })
  testimonial_text: string;

  @ApiProperty({
    description:
      'Array of URLs or paths for trip images associated with the testimonial',
    example: [
      '/assets/images/trips/patagonia1.jpg',
      '/assets/images/trips/patagonia2.jpg',
    ],
    required: false,
    type: [String],
  })
  trip_image_urls: string[];

  @ApiProperty({ description: 'Timestamp when the testimonial was created' })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the testimonial was last updated',
  })
  updated_at: Date;
}
