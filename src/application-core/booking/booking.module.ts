import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { Booking } from '../../infrastructure/database/entities/booking.entity';
import { BookingParticipant } from '../../infrastructure/database/entities/booking-participant.entity';
import { GetPaginatedBookingsInteractor } from './uses-cases/get-paginated-bookings.interactor';
import { GetBookingByIdInteractor } from './uses-cases/get-booking-by-id.interactor';
import { UpdateBookingStatusInteractor } from './uses-cases/update-booking-status.interactor';
import { BookingController } from '../../user-interface/controllers/booking.controller';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Booking, BookingParticipant]),
  ],
  providers: [
    GetPaginatedBookingsInteractor,
    GetBookingByIdInteractor,
    UpdateBookingStatusInteractor,
  ],
  controllers: [BookingController],
  exports: [
    GetPaginatedBookingsInteractor,
    GetBookingByIdInteractor,
    UpdateBookingStatusInteractor,
  ],
})
export class BookingModule {}
