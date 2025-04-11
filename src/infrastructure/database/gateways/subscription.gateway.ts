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

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedSubscriptionsResponseDTO> {
    this.logger.debug(
      `Obteniendo suscripciones página ${page}, límite ${limit}`,
    );
    try {
      const [data, total] = await this.subscriptionRepository.findAndCount({
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
