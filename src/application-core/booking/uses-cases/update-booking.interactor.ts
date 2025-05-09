import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { BookingGateway } from '../../../domain/gateways/booking.gateway';
import { BookingResponseDTO, UpdateBookingDTO } from '../dto/booking.dto';

@Injectable()
export class UpdateBookingInteractor {
  constructor(
    @Inject('BookingGateway') private readonly bookingGateway: BookingGateway,
  ) {}

  async execute(
    id: number,
    updateData: UpdateBookingDTO,
  ): Promise<BookingResponseDTO> {
    // Comprobar si existe la reserva
    const booking = await this.bookingGateway.findById(id);
    if (!booking) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    // Convertir fechas si se proporcionan
    const updateDataTransformed: any = { ...updateData };
    if (updateDataTransformed.startDate) {
      updateDataTransformed.startDate = new Date(
        updateDataTransformed.startDate,
      );
    }
    if (updateDataTransformed.endDate) {
      updateDataTransformed.endDate = new Date(updateDataTransformed.endDate);
    }

    // Actualizar la reserva
    return this.bookingGateway.update(id, updateDataTransformed);
  }
}
