import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Booking,
  BookingStatus,
  BookingType,
} from '../entities/booking.entity';
import {
  PaginatedBookingsResponseDTO,
  BookingFiltersDTO,
} from '../../../application-core/booking/dto/booking.dto';

@Injectable()
export class BookingGateway {
  private readonly logger = new Logger(BookingGateway.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    filters?: BookingFiltersDTO,
  ): Promise<PaginatedBookingsResponseDTO> {
    this.logger.debug(
      `Obteniendo reservas página ${page}, límite ${limit}, filtros: ${JSON.stringify(
        filters,
      )}`,
    );
    try {
      const queryBuilder = this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.participants', 'participants')
        .orderBy('booking.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      if (filters?.status) {
        queryBuilder.andWhere('booking.status = :status', {
          status: filters.status,
        });
      }

      if (filters?.bookingType) {
        queryBuilder.andWhere('booking.bookingType = :bookingType', {
          bookingType: filters.bookingType,
        });
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error obteniendo reservas: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: number): Promise<Booking> {
    this.logger.debug(`Buscando reserva con ID: ${id}`);
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['participants'],
      });

      if (!booking) {
        throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
      }

      return booking;
    } catch (error) {
      this.logger.error(
        `Error buscando reserva ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateStatus(
    id: number,
    status: BookingStatus,
    bookingType: BookingType,
  ): Promise<Booking> {
    this.logger.debug(
      `Actualizando estado de reserva ${id} a ${status} y tipo a ${bookingType}`,
    );
    try {
      const booking = await this.findById(id);
      booking.status = status;
      booking.bookingType = bookingType;
      return await this.bookingRepository.save(booking);
    } catch (error) {
      this.logger.error(
        `Error actualizando estado de reserva ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
