import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SubscriptionGateway } from '../../../infrastructure/database/gateways/subscription.gateway';
import { SubscriptionResponseDTO } from '../dto/subscription.dto';

@Injectable()
export class ToggleSubscriptionStatusInteractor {
  constructor(
    @Inject(SubscriptionGateway)
    private readonly subscriptionGateway: SubscriptionGateway,
  ) {}

  async execute(id: number): Promise<SubscriptionResponseDTO> {
    // Obtener la suscripción existente
    const subscription = await this.subscriptionGateway.findById(id);

    if (!subscription) {
      throw new NotFoundException(`Suscripción con ID ${id} no encontrada`);
    }

    // Cambiar el estado
    subscription.isActive = !subscription.isActive;

    // Guardar la suscripción actualizada
    const updatedSubscription = await this.subscriptionGateway.update(id, {
      isActive: subscription.isActive,
    });

    return {
      id: updatedSubscription.id,
      email: updatedSubscription.email,
      isActive: updatedSubscription.isActive,
      createdAt: updatedSubscription.createdAt,
    };
  }
}
