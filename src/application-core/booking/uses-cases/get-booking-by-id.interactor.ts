import { Injectable, Inject } from '@nestjs/common';
import { BookingGateway } from '../../../infrastructure/database/gateways/booking.gateway';
import { Booking } from '../../../infrastructure/database/entities/booking.entity';

@Injectable()
export class GetBookingByIdInteractor {
  constructor(
    @Inject(BookingGateway)
    private readonly bookingGateway: BookingGateway,
  ) {}

  async execute(id: number): Promise<Booking> {
    return this.bookingGateway.findById(id);
  }
}
