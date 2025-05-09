import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  BookingGateway as BookingGatewayInterface,
  CreateBookingData,
  CreateBookingParticipantData,
} from '../../../domain/gateways/booking.gateway';
import {
  BookingResponseDTO,
  BookingFiltersDTO,
} from '../../../application-core/booking/dto/booking.dto';
import {
  Booking,
  BookingStatus,
  BookingType,
} from '../entities/booking.entity';
import { BookingParticipant } from '../entities/booking-participant.entity';
import { Destination } from '../entities/destination.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BookingGateway implements BookingGatewayInterface {
  private readonly logger = new Logger(BookingGateway.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingParticipant)
    private readonly participantRepository: Repository<BookingParticipant>,
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: CreateBookingData): Promise<{ id: number }> {
    this.logger.debug(`Creando nueva reserva`);
    try {
      const booking = this.bookingRepository.create(data);
      const savedBooking = await this.bookingRepository.save(booking);
      return { id: savedBooking.id };
    } catch (error) {
      this.logger.error(`Error creando reserva: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: number): Promise<BookingResponseDTO> {
    this.logger.debug(`Buscando reserva con ID: ${id}`);
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['participants', 'destination', 'user'],
      });

      if (!booking) {
        throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
      }

      const response: BookingResponseDTO = {
        ...booking,
        participants: booking.participants || [],
        destinationName: booking.destination?.title || null,
        contactName: booking.user
          ? `${booking.user.firstName || ''} ${
              booking.user.lastName || ''
            }`.trim()
          : null,
        contactPhone: booking.user?.phone || null,
      };

      return response;
    } catch (error) {
      this.logger.error(
        `Error buscando reserva ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<BookingResponseDTO[]> {
    this.logger.debug(`Buscando reservas del usuario con ID: ${userId}`);
    try {
      const bookings = await this.bookingRepository.find({
        where: { userId },
        relations: ['participants', 'destination', 'user'],
        order: { createdAt: 'DESC' },
      });

      return bookings.map((booking) => ({
        ...booking,
        participants: booking.participants || [],
        destinationName: booking.destination?.title || null,
        contactName: booking.user
          ? `${booking.user.firstName || ''} ${
              booking.user.lastName || ''
            }`.trim()
          : null,
        contactPhone: booking.user?.phone || null,
      }));
    } catch (error) {
      this.logger.error(
        `Error buscando reservas del usuario ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: number,
    data: Partial<CreateBookingData>,
  ): Promise<BookingResponseDTO> {
    this.logger.debug(`Actualizando reserva con ID: ${id}`);
    try {
      await this.bookingRepository.update(id, data);
      return this.findById(id);
    } catch (error) {
      this.logger.error(
        `Error actualizando reserva ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateStatus(
    id: number,
    status: BookingStatus,
  ): Promise<BookingResponseDTO> {
    this.logger.debug(`Actualizando estado de reserva ${id} a ${status}`);
    try {
      await this.bookingRepository.update(id, { status });
      return this.findById(id);
    } catch (error) {
      this.logger.error(
        `Error actualizando estado de reserva ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getPaginated(
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
  }> {
    this.logger.debug(
      `Obteniendo reservas página ${page}, límite ${limit}, filtros: ${JSON.stringify(
        filters,
      )}`,
    );
    try {
      const where: FindOptionsWhere<Booking> = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.bookingType) {
        where.bookingType = filters.bookingType;
      }

      const [bookings, total] = await this.bookingRepository.findAndCount({
        where,
        relations: ['participants', 'destination', 'user'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: bookings.map((booking) => ({
          ...booking,
          participants: booking.participants || [],
          destinationName: booking.destination?.title || null,
          contactName: booking.user
            ? `${booking.user.firstName || ''} ${
                booking.user.lastName || ''
              }`.trim()
            : null,
          contactPhone: booking.user?.phone || null,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages,
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

  async createParticipant(
    data: CreateBookingParticipantData,
  ): Promise<{ id: number }> {
    this.logger.debug(`Creando nuevo participante`);
    try {
      const participant = this.participantRepository.create(data);
      const savedParticipant = await this.participantRepository.save(
        participant,
      );
      return { id: savedParticipant.id };
    } catch (error) {
      this.logger.error(
        `Error creando participante: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
