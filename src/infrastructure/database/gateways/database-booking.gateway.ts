import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { BookingParticipant } from '../entities/booking-participant.entity';
import {
  BookingGateway,
  CreateBookingData,
  CreateBookingParticipantData,
} from '../../../domain/gateways/booking.gateway';
import {
  BookingResponseDTO,
  BookingFiltersDTO,
  PaginatedBookingsResponseDTO,
} from '../../../application-core/booking/dto/booking.dto';

@Injectable()
export class DatabaseBookingGateway implements BookingGateway {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingParticipant)
    private readonly participantRepository: Repository<BookingParticipant>,
  ) {}

  async create(data: CreateBookingData): Promise<{ id: number }> {
    const booking = this.bookingRepository.create(data);
    const savedBooking = await this.bookingRepository.save(booking);
    return { id: savedBooking.id };
  }

  async findById(id: number): Promise<BookingResponseDTO> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['participants'],
    });

    if (!booking) {
      throw new Error(`Booking with id ${id} not found`);
    }

    return this.mapToDTO(booking);
  }

  async findByUserId(userId: number): Promise<BookingResponseDTO[]> {
    const bookings = await this.bookingRepository.find({
      where: { userId },
      relations: ['participants'],
      order: { createdAt: 'DESC' },
    });

    return bookings.map((booking) => this.mapToDTO(booking));
  }

  async update(
    id: number,
    data: Partial<CreateBookingData>,
  ): Promise<BookingResponseDTO> {
    await this.bookingRepository.update(id, data);
    return this.findById(id);
  }

  async updateStatus(
    id: number,
    status: BookingStatus,
  ): Promise<BookingResponseDTO> {
    await this.bookingRepository.update(id, { status });
    return this.findById(id);
  }

  async getPaginated(
    page: number,
    limit: number,
    filters?: BookingFiltersDTO,
  ): Promise<PaginatedBookingsResponseDTO> {
    const where: FindOptionsWhere<Booking> = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.bookingType) {
      where.bookingType = filters.bookingType;
    }

    const [bookings, total] = await this.bookingRepository.findAndCount({
      where,
      relations: ['participants'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: bookings.map((booking) => this.mapToDTO(booking)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async createParticipant(
    data: CreateBookingParticipantData,
  ): Promise<{ id: number }> {
    const participant = this.participantRepository.create(data);
    const savedParticipant = await this.participantRepository.save(participant);
    return { id: savedParticipant.id };
  }

  private mapToDTO(booking: Booking): BookingResponseDTO {
    return {
      id: booking.id,
      userId: booking.userId,
      destinationId: booking.destinationId,
      status: booking.status,
      bookingType: booking.bookingType,
      startDate: booking.startDate,
      endDate: booking.endDate,
      numPeople: booking.numPeople,
      totalPrice: Number(booking.totalPrice),
      specialRequests: booking.specialRequests,
      needsFlight: booking.needsFlight || false,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      participants:
        booking.participants?.map((participant) => ({
          id: participant.id,
          bookingId: participant.bookingId,
          fullName: participant.fullName,
          age: participant.age,
          documentType: participant.documentType,
          documentNumber: participant.documentNumber,
          createdAt: participant.createdAt,
        })) || [],
    };
  }
}
