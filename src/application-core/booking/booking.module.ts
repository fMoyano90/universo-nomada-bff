import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { Booking } from '../../infrastructure/database/entities/booking.entity';
import { BookingParticipant } from '../../infrastructure/database/entities/booking-participant.entity';
import { GetPaginatedBookingsInteractor } from './uses-cases/get-paginated-bookings.interactor';
import { GetBookingByIdInteractor } from './uses-cases/get-booking-by-id.interactor';
import { UpdateBookingStatusInteractor } from './uses-cases/update-booking-status.interactor';
import { BookingGateway } from '../../infrastructure/database/gateways/booking.gateway';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Booking, BookingParticipant]),
  ],
  providers: [
    BookingGateway,
    GetPaginatedBookingsInteractor,
    GetBookingByIdInteractor,
    UpdateBookingStatusInteractor,
  ],
  controllers: [],
  exports: [
    GetPaginatedBookingsInteractor,
    GetBookingByIdInteractor,
    UpdateBookingStatusInteractor,
  ],
})
export class BookingModule {}
