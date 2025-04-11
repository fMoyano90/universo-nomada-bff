import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Destination } from './destination.entity';

@Entity('includes')
export class Include {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'destination_id' })
  destinationId: number;

  @Column({ type: 'text' })
  item: string;

  @ManyToOne(() => Destination, (destination) => destination.includes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;
}
