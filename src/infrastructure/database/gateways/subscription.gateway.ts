import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { PaginatedSubscriptionsResponseDTO } from '../../../application-core/subscription/dto/subscription.dto';

@Injectable()
export class SubscriptionGateway {
  private readonly logger = new Logger(SubscriptionGateway.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(email: string): Promise<Subscription> {
    this.logger.debug(`Creando suscripción para email: ${email}`);
    try {
      const subscription = this.subscriptionRepository.create({ email });
      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      this.logger.error(
        `Error creando suscripción para ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    this.logger.debug(`Eliminando suscripción con ID: ${id}`);
    try {
      await this.subscriptionRepository.update(id, { isActive: false });
    } catch (error) {
      this.logger.error(
        `Error eliminando suscripción ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: number): Promise<Subscription | null> {
    this.logger.debug(`Buscando suscripción con ID: ${id}`);
    try {
      return await this.subscriptionRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(
        `Error buscando suscripción ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: number, data: Partial<Subscription>): Promise<Subscription> {
    this.logger.debug(`Actualizando suscripción con ID: ${id}`);
    try {
      await this.subscriptionRepository.update(id, data);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(
        `Error actualizando suscripción ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(
    page: number,
    limit: number,
    isActive?: boolean,
  ): Promise<PaginatedSubscriptionsResponseDTO> {
    this.logger.debug(
      `Obteniendo suscripciones página ${page}, límite ${limit}, filtro activo: ${isActive}`,
    );
    try {
      // Construir condiciones de búsqueda
      const where = isActive !== undefined ? { isActive } : {};

      // Ejecutar la consulta con filtros
      const [data, total] = await this.subscriptionRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

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
        `Error obteniendo suscripciones: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
