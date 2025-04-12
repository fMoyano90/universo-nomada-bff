import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check,
} from 'typeorm';
import { User } from './user.entity';
import { Destination } from './destination.entity';
import { BookingParticipant } from './booking-participant.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum BookingType {
  QUOTE = 'quote',
  BOOKING = 'booking',
}

@Entity('bookings')
@Check('end_date > start_date')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'destination_id' })
  destinationId: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({
    name: 'booking_type',
    type: 'varchar',
    length: 50,
  })
  bookingType: BookingType;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'num_people' })
  numPeople: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice: number;

  @Column({ name: 'special_requests', type: 'text', nullable: true })
  specialRequests?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Destination, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;

  @OneToMany(() => BookingParticipant, (participant) => participant.booking)
  participants: BookingParticipant[];
}
