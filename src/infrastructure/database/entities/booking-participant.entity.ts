import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('booking_participants')
@Unique(['bookingId', 'documentNumber'])
export class BookingParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_id' })
  bookingId: number;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column()
  age: number;

  @Column({ name: 'document_type', length: 50 })
  documentType: string;

  @Column({ name: 'document_number', length: 100 })
  documentNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Booking, (booking) => booking.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}
