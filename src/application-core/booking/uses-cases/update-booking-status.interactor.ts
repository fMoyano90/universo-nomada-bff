import { Injectable, Inject } from '@nestjs/common';
import { BookingGateway } from '../../../infrastructure/database/gateways/booking.gateway';
import { Booking } from '../../../infrastructure/database/entities/booking.entity';
import { UpdateBookingStatusDTO } from '../dto/booking.dto';

@Injectable()
export class UpdateBookingStatusInteractor {
  constructor(
    @Inject(BookingGateway)
    private readonly bookingGateway: BookingGateway,
  ) {}

  async execute(id: number, dto: UpdateBookingStatusDTO): Promise<Booking> {
    return this.bookingGateway.updateStatus(id, dto.status, dto.bookingType);
  }
}
