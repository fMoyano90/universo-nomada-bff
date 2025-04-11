import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Destination } from './destination.entity';
import { ItineraryDetail } from './itinerary-detail.entity';

@Entity('itinerary_items')
export class ItineraryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'destination_id' })
  destinationId: number;

  @Column({ length: 50 })
  day: string;

  @Column({ length: 255 })
  title: string;

  @ManyToOne(() => Destination, (destination) => destination.itineraryItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;

  @OneToMany(() => ItineraryDetail, (detail) => detail.itineraryItem, {
    cascade: true,
  })
  details: ItineraryDetail[];
}
