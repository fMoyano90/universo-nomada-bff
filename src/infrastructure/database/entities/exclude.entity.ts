import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Destination } from './destination.entity';

@Entity('excludes')
export class Exclude {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'destination_id' })
  destinationId: number;

  @Column({ type: 'text' })
  item: string;

  @ManyToOne(() => Destination, (destination) => destination.excludes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;
}
