import { Injectable, Inject } from '@nestjs/common';
import { BookingGateway } from '../../../domain/gateways/booking.gateway';
import { UpdateBookingStatusDTO, BookingResponseDTO } from '../dto/booking.dto';

@Injectable()
export class UpdateBookingStatusInteractor {
  constructor(
    @Inject('BookingGateway')
    private readonly bookingGateway: BookingGateway,
  ) {}

  async execute(
    id: number,
    dto: UpdateBookingStatusDTO,
  ): Promise<BookingResponseDTO> {
    return this.bookingGateway.updateStatus(id, dto.status);
  }
}
