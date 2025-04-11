import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Destination } from './destination.entity';

@Entity('tips')
export class Tip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'destination_id' })
  destinationId: number;

  @Column({ type: 'text' })
  tip: string;

  @ManyToOne(() => Destination, (destination) => destination.tips, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;
}
