import { Injectable, Logger, Inject } from '@nestjs/common';
import { BookingGateway } from '../../../infrastructure/database/gateways/booking.gateway';
import { UserGateway } from '../../../infrastructure/database/gateways/user.gateway';
import { IDestinationGateway } from '../../../domain/gateways/destination.gateway';
import { CreateQuoteDTO, BookingResponseDTO } from '../dto/booking.dto';
import {
  BookingStatus,
  BookingType,
} from '../../../infrastructure/database/entities/booking.entity';

@Injectable()
export class CreateQuoteInteractor {
  private readonly logger = new Logger(CreateQuoteInteractor.name);

  constructor(
    @Inject('BookingGateway')
    private readonly bookingGateway: BookingGateway,
    @Inject('UserGateway')
    private readonly userGateway: UserGateway,
    @Inject('DestinationGateway')
    private readonly destinationGateway: IDestinationGateway,
  ) {}

  async execute(
    createQuoteDto: CreateQuoteDTO,
    userId?: number,
  ): Promise<BookingResponseDTO> {
    this.logger.log(
      `Creando ${
        createQuoteDto.bookingType === BookingType.BOOKING
          ? 'reserva'
          : 'cotización'
      } para destino ID: ${createQuoteDto.destinationId}`,
    );

    // Verificar si el destino existe
    const destination = await this.destinationGateway.findById(
      createQuoteDto.destinationId,
    );
    if (!destination) {
      throw new Error('El destino seleccionado no existe');
    }

    // Si no viene un userId (usuario anónimo), creamos un usuario temporal
    let userIdToUse = userId;
    if (!userId) {
      // Crear usuario temporal basado en la información de contacto
      const tempUser = await this.userGateway.createTemporaryUser({
        name: createQuoteDto.contactInfo.name,
        email: createQuoteDto.contactInfo.email,
        phone: createQuoteDto.contactInfo.phone,
      });
      userIdToUse = tempUser.id;
    }

    // Calcular el número total de personas
    const totalPeople =
      createQuoteDto.adults +
      (createQuoteDto.children || 0) +
      (createQuoteDto.infants || 0) +
      (createQuoteDto.seniors || 0);

    // Determinar el tipo de solicitud (cotización o reserva directa)
    let bookingType;
    if (createQuoteDto.bookingType) {
      // Verificar si el valor enviado coincide directamente con los valores del enum
      if (createQuoteDto.bookingType === 'quote') {
        bookingType = BookingType.QUOTE;
      } else if (createQuoteDto.bookingType === 'booking') {
        bookingType = BookingType.BOOKING;
      } else {
        // Intentar la notación por clave si no coincide directamente
        bookingType =
          BookingType[createQuoteDto.bookingType as keyof typeof BookingType] ||
          BookingType.QUOTE;
      }
    } else {
      bookingType = BookingType.QUOTE;
    }

    // Crear la solicitud en la base de datos
    const newQuote = await this.bookingGateway.create({
      userId: userIdToUse,
      destinationId: createQuoteDto.destinationId,
      bookingType,
      status: BookingStatus.PENDING,
      startDate: createQuoteDto.startDate
        ? new Date(createQuoteDto.startDate)
        : null,
      endDate: createQuoteDto.endDate ? new Date(createQuoteDto.endDate) : null,
      numPeople: totalPeople,
      totalPrice: 0, // El precio se determina posteriormente por el admin
      specialRequests: this.buildSpecialRequestsString(createQuoteDto),
    });

    return this.bookingGateway.findById(newQuote.id);
  }

  private buildSpecialRequestsString(createQuoteDto: CreateQuoteDTO): string {
    // Construir un mensaje con información relevante para el administrador
    const parts = [
      createQuoteDto.specialRequests || '',
      `Adultos: ${createQuoteDto.adults}`,
      `Niños: ${createQuoteDto.children || 0}`,
      `Infantes: ${createQuoteDto.infants || 0}`,
      `Adultos mayores: ${createQuoteDto.seniors || 0}`,
      `Necesita alojamiento: ${
        createQuoteDto.needsAccommodation ? 'Sí' : 'No'
      }`,
      `Contacto: ${createQuoteDto.contactInfo.name}, ${createQuoteDto.contactInfo.email}, ${createQuoteDto.contactInfo.phone}`,
    ];

    return parts.filter((part) => part).join('\n');
  }
}
