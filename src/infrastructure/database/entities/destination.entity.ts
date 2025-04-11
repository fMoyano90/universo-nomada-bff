import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ItineraryItem } from './itinerary-item.entity';
import { Include } from './include.entity';
import { Exclude } from './exclude.entity';
import { Tip } from './tip.entity';
import { Faq } from './faq.entity';
import { GalleryImage } from './gallery-image.entity';
import { DestinationType } from '../enums/destination-type.enum'; // Import the shared enum

@Entity('destinations')
export class Destination {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', name: 'image_src' })
  imageSrc: string;

  @Column({ length: 100 })
  duration: string;

  @Column({ length: 50, name: 'activity_level' })
  activityLevel: string;

  @Column({ type: 'varchar', array: true, length: 50, name: 'activity_type' })
  activityType: string[];

  @Column({ length: 100, name: 'group_size', nullable: true })
  groupSize: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 255 })
  location: string;

  @Column({ type: 'boolean', default: false, name: 'is_recommended' })
  isRecommended: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_special' })
  isSpecial: boolean;

  @Column({
    type: 'enum',
    enum: DestinationType,
  })
  type: DestinationType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ItineraryItem, (item) => item.destination, { cascade: true })
  itineraryItems: ItineraryItem[];

  @OneToMany(() => Include, (item) => item.destination, { cascade: true })
  includes: Include[];

  @OneToMany(() => Exclude, (item) => item.destination, { cascade: true })
  excludes: Exclude[];

  @OneToMany(() => Tip, (item) => item.destination, { cascade: true })
  tips: Tip[];

  @OneToMany(() => Faq, (item) => item.destination, { cascade: true })
  faqs: Faq[];

  @OneToMany(() => GalleryImage, (item) => item.destination, { cascade: true })
  galleryImages: GalleryImage[];
}
