import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('testimonials')
export class Testimonial {
  @ApiProperty({
    description: 'Unique identifier for the testimonial',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Name of the traveler', example: 'Juan Pérez' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ApiProperty({
    description: "URL or path to the traveler's avatar image",
    example: '/assets/images/avatars/juan.jpg',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_image_url: string;

  @ApiProperty({
    description: 'Rating given by the traveler (1-5)',
    example: 5,
  })
  @Column({ type: 'smallint', nullable: false })
  rating: number;

  @ApiProperty({
    description: 'The main text of the testimonial',
    example: '¡Un viaje increíble!',
  })
  @Column({ type: 'text', nullable: false })
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
  @Column({ type: 'text', array: true, nullable: true })
  trip_image_urls: string[];

  @ApiProperty({ description: 'Timestamp when the testimonial was created' })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the testimonial was last updated',
  })
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
