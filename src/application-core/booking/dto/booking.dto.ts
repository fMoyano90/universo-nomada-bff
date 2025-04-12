import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import {
  BookingStatus,
  BookingType,
} from '../../../infrastructure/database/entities/booking.entity';

export class UpdateBookingStatusDTO {
  @ApiProperty({
    enum: BookingStatus,
    description: 'Estado de la reserva',
    example: BookingStatus.CONFIRMED,
  })
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;

  @ApiProperty({
    enum: BookingType,
    description: 'Tipo de reserva',
    example: BookingType.BOOKING,
  })
  @IsEnum(BookingType)
  @IsNotEmpty()
  bookingType: BookingType;
}

export class BookingFiltersDTO {
  @ApiProperty({
    enum: BookingStatus,
    description: 'Filtrar por estado de la reserva',
    required: false,
  })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiProperty({
    enum: BookingType,
    description: 'Filtrar por tipo de reserva',
    required: false,
  })
  @IsEnum(BookingType)
  @IsOptional()
  bookingType?: BookingType;
}

export class BookingResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  destinationId: number;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ enum: BookingType })
  bookingType: BookingType;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  numPeople: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty({ required: false })
  specialRequests?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => BookingParticipantResponseDTO, isArray: true })
  participants: BookingParticipantResponseDTO[];
}

export class BookingParticipantResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  bookingId: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  documentType: string;

  @ApiProperty()
  documentNumber: string;

  @ApiProperty()
  createdAt: Date;
}

export class PaginatedBookingsResponseDTO {
  @ApiProperty({ type: [BookingResponseDTO] })
  data: BookingResponseDTO[];

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number' },
      page: { type: 'number' },
      limit: { type: 'number' },
      totalPages: { type: 'number' },
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
