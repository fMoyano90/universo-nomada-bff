import { Injectable, Inject } from '@nestjs/common';
import { BookingGateway } from '../../../domain/gateways/booking.gateway';
import {
  PaginatedBookingsResponseDTO,
  BookingFiltersDTO,
} from '../dto/booking.dto';

@Injectable()
export class GetPaginatedBookingsInteractor {
  constructor(
    @Inject('BookingGateway')
    private readonly bookingGateway: BookingGateway,
  ) {}

  async execute(
    page: number,
    limit: number,
    filters?: BookingFiltersDTO,
  ): Promise<PaginatedBookingsResponseDTO> {
    return this.bookingGateway.getPaginated(page, limit, filters);
  }
}
