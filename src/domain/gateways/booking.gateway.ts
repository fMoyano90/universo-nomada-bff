import {
  BookingResponseDTO,
  BookingFiltersDTO,
} from '../../application-core/booking/dto/booking.dto';
import {
  BookingStatus,
  BookingType,
} from '../../infrastructure/database/entities/booking.entity';

export interface CreateBookingData {
  userId: number;
  destinationId: number;
  bookingType: BookingType;
  status: BookingStatus;
  startDate: Date | null;
  endDate: Date | null;
  numPeople: number;
  totalPrice: number;
  specialRequests?: string;
}

export interface CreateBookingParticipantData {
  bookingId: number;
  fullName: string;
  age: number;
  documentType: string;
  documentNumber: string;
}

export interface BookingGateway {
  create(data: CreateBookingData): Promise<{ id: number }>;
  findById(id: number): Promise<BookingResponseDTO>;
  findByUserId(userId: number): Promise<BookingResponseDTO[]>;
  update(
    id: number,
    data: Partial<CreateBookingData>,
  ): Promise<BookingResponseDTO>;
  updateStatus(id: number, status: BookingStatus): Promise<BookingResponseDTO>;
  getPaginated(
    page: number,
    limit: number,
    filters?: BookingFiltersDTO,
  ): Promise<{
    data: BookingResponseDTO[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  createParticipant(
    data: CreateBookingParticipantData,
  ): Promise<{ id: number }>;
}
