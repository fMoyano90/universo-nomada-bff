import { Injectable, Logger } from '@nestjs/common';
import { UserGateway } from '../../../infrastructure/database/gateways/user.gateway';
import { UpdateUserRequestDTO } from '../dto/user.dto';
// import * as bcrypt from 'bcrypt'; // Unused import
import { User } from '../../../infrastructure/database/entities/user.entity';

@Injectable()
export class UpdateUserInteractor {
  private logger = new Logger('UpdateUserInteractor');

  constructor(private readonly userGateway: UserGateway) {}

  async execute(
    userId: number,
    updateUserRequestDTO: UpdateUserRequestDTO,
  ): Promise<Partial<User>> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.userGateway.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Crear objeto con datos actualizados
      const userData: Partial<User> = {
        email: updateUserRequestDTO.email,
        firstName: updateUserRequestDTO.firstName,
        lastName: updateUserRequestDTO.lastName,
        role: updateUserRequestDTO.role,
        phone: updateUserRequestDTO.phone,
        // Removed position, emergencyContactPhone, rut, companyId
      };

      // If a new password hash is provided, include it
      if (updateUserRequestDTO.passwordHash) {
        userData.passwordHash = updateUserRequestDTO.passwordHash;
      }

      // Filter out undefined values before updating
      Object.keys(userData).forEach(
        (key) => userData[key] === undefined && delete userData[key],
      );

      // Actualizar el usuario
      const updatedUser = await this.userGateway.update(userId, userData);

      // Eliminar datos sensibles antes de retornar
      const { passwordHash: _, ...result } = updatedUser; // Use passwordHash
      return result;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }
}
