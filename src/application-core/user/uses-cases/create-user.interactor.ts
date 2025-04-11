import { Injectable, Logger } from '@nestjs/common';
import { UserGateway } from '../../../infrastructure/database/gateways/user.gateway';
import { CreateUserRequestDTO } from '../dto/user.dto';
// import * as bcrypt from 'bcrypt'; // Unused import
import { AzureStorageService } from 'src/infrastructure/services/azure-storage.service';
import { User } from '../../../infrastructure/database/entities/user.entity';

@Injectable()
export class CreateUserInteractor {
  private logger = new Logger('CreateUserInteractor');

  constructor(
    private readonly userGateway: UserGateway,
    private azureStorageService: AzureStorageService,
  ) {}

  async execute(
    createUserRequestDTO: CreateUserRequestDTO,
    file?: Express.Multer.File,
  ): Promise<any> {
    try {
      this.logger.debug('Creating user');

      // Crear objeto de usuario con los campos adecuados
      const userData: Partial<User> = {
        email: createUserRequestDTO.email,
        passwordHash: createUserRequestDTO.passwordHash, // Use passwordHash
        firstName: createUserRequestDTO.firstName || '',
        lastName: createUserRequestDTO.lastName || '',
        role: createUserRequestDTO.role || 'user',
        phone: createUserRequestDTO.phone || null,
        // Removed position, emergencyContactPhone, rut, companyId
        isActive: true,
      };

      // Procesar archivo si existe
      if (file && file.buffer) {
        try {
          const avatarUrl = await this.azureStorageService.uploadBlob(
            `avatars/${Date.now()}-${file.originalname}`,
            file.buffer,
            file.mimetype,
          );
          // Nota: la entidad User no tiene campo avatar, lo manejamos separadamente
        } catch (uploadError) {
          this.logger.error(`Error uploading avatar: ${uploadError.message}`);
        }
      }

      const user = await this.userGateway.create(userData);

      // Eliminar datos sensibles antes de retornar
      const { passwordHash: _, ...result } = user; // Use passwordHash
      return result;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }
}
