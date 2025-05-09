import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
// import * as bcrypt from 'bcrypt'; // Unused import
import { SecurityUtils } from '../../../common/utils/security.utils';
import { UserRole } from '../../../application-core/user/dto/user.dto';
import { CreateTemporaryUserData } from '../../../domain/gateways/user.gateway';

@Injectable()
export class UserGateway {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.passwordHash) {
      userData.passwordHash = await SecurityUtils.hashPassword(
        userData.passwordHash,
      );
    }
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    if (userData.passwordHash) {
      userData.passwordHash = await SecurityUtils.hashPassword(
        userData.passwordHash,
      );
    }
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

  // Implementación del método para crear usuarios temporales
  async createTemporaryUser(
    data: CreateTemporaryUserData,
  ): Promise<{ id: number }> {
    // Verificar si ya existe un usuario con ese email
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      // Si ya existe, retornamos el ID del usuario existente
      return { id: existingUser.id };
    }

    // Si no existe, creamos un nuevo usuario temporal
    const newUser = this.userRepository.create({
      email: data.email,
      firstName: data.name.split(' ')[0] || 'Temporal',
      lastName: data.name.split(' ').slice(1).join(' ') || 'User',
      phone: data.phone,
      role: UserRole.USER, // Asignamos el rol de usuario normal
      isActive: true,
      // Generamos una contraseña aleatoria para cumplir con las restricciones
      passwordHash:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15).toUpperCase() +
        '123',
    });

    // Guardar el usuario
    const savedUser = await this.userRepository.save(newUser);
    return { id: savedUser.id };
  }
}
