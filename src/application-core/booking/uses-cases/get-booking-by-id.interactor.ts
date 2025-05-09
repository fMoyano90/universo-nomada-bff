import { Injectable, Inject } from '@nestjs/common';
import { BookingGateway } from '../../../domain/gateways/booking.gateway';
import { BookingResponseDTO } from '../dto/booking.dto';

@Injectable()
export class GetBookingByIdInteractor {
  constructor(
    @Inject('BookingGateway')
    private readonly bookingGateway: BookingGateway,
  ) {}

  async execute(id: number): Promise<BookingResponseDTO> {
    return this.bookingGateway.findById(id);
  }
}
