import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { Booking } from '../../infrastructure/database/entities/booking.entity';
import { BookingParticipant } from '../../infrastructure/database/entities/booking-participant.entity';
import { User } from '../../infrastructure/database/entities/user.entity';
import { Destination } from '../../infrastructure/database/entities/destination.entity';
import { BookingGateway } from '../../infrastructure/database/gateways/booking.gateway';
import { UserGateway } from '../../infrastructure/database/gateways/user.gateway';
import { DestinationGateway } from '../../infrastructure/database/gateways/destination.gateway';
import { GetPaginatedBookingsInteractor } from './uses-cases/get-paginated-bookings.interactor';
import { GetBookingByIdInteractor } from './uses-cases/get-booking-by-id.interactor';
import { UpdateBookingStatusInteractor } from './uses-cases/update-booking-status.interactor';
import { CreateQuoteInteractor } from './uses-cases/create-quote.interactor';
import { UpdateBookingInteractor } from './uses-cases/update-booking.interactor';
import { BookingController } from '../../user-interface/controllers/booking.controller';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Booking, BookingParticipant, User, Destination]),
  ],
  providers: [
    {
      provide: 'BookingGateway',
      useClass: BookingGateway,
    },
    {
      provide: 'UserGateway',
      useClass: UserGateway,
    },
    {
      provide: 'DestinationGateway',
      useClass: DestinationGateway,
    },
    GetPaginatedBookingsInteractor,
    GetBookingByIdInteractor,
    UpdateBookingStatusInteractor,
    CreateQuoteInteractor,
    UpdateBookingInteractor,
  ],
  controllers: [BookingController],
  exports: [
    GetPaginatedBookingsInteractor,
    GetBookingByIdInteractor,
    UpdateBookingStatusInteractor,
    CreateQuoteInteractor,
    UpdateBookingInteractor,
  ],
})
export class BookingModule {}
