import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ItineraryItem } from './itinerary-item.entity';

@Entity('itinerary_details')
export class ItineraryDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'itinerary_item_id' })
  itineraryItemId: number;

  @Column({ type: 'text' })
  detail: string;

  @ManyToOne(() => ItineraryItem, (item) => item.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'itinerary_item_id' })
  itineraryItem: ItineraryItem;
}
