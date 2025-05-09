import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  Min,
  Max,
  IsArray,
} from 'class-validator';
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

export class BookingParticipantDTO {
  @ApiProperty({
    description: 'Nombre completo',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Edad',
    example: 35,
  })
  @IsNumber()
  @IsNotEmpty()
  age: number;

  @ApiProperty({
    description: 'Tipo de documento',
    example: 'Pasaporte',
  })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({
    description: 'Número de documento',
    example: 'AB123456',
  })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;
}

export class CreateQuoteDTO {
  @ApiProperty({
    description: 'ID del destino seleccionado',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  destinationId: number;

  @ApiProperty({
    description: 'Fecha de inicio (si está establecida)',
    example: '2023-06-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin (si está establecida)',
    example: '2023-06-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Número de adultos',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Número de adultos',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsNotEmpty()
  adults = 0;

  @ApiProperty({
    description: 'Número de niños',
    example: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(8)
  @IsOptional()
  children = 0;

  @ApiProperty({
    description: 'Número de infantes',
    example: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  infants = 0;

  @ApiProperty({
    description: 'Número de adultos mayores',
    example: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  seniors = 0;

  @ApiProperty({
    description: 'Si necesita alojamiento',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  needsAccommodation: boolean;

  @ApiProperty({
    description: 'Requisitos especiales',
    example: 'Necesito un guía que hable español',
    required: false,
  })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty({
    description: 'Información de contacto del usuario',
    example: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+56912345678',
    },
  })
  @IsNotEmpty()
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export class CreateBookingDTO extends CreateQuoteDTO {
  @ApiProperty({
    description: 'Lista de participantes',
    type: [BookingParticipantDTO],
  })
  @IsArray()
  @IsNotEmpty()
  participants: BookingParticipantDTO[];
}
