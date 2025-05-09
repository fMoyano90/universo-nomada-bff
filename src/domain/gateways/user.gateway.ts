import { UserResponseDTO } from '../../application-core/user/dto/user.dto';

export interface CreateTemporaryUserData {
  name: string;
  email: string;
  phone: string;
}

export interface UserGateway {
  findById(id: number): Promise<UserResponseDTO>;
  findByEmail(email: string): Promise<UserResponseDTO | null>;
  create(data: Partial<UserResponseDTO>): Promise<UserResponseDTO>;
  update(id: number, data: Partial<UserResponseDTO>): Promise<UserResponseDTO>;
  delete(id: number): Promise<void>;
  findAll(): Promise<UserResponseDTO[]>;

  // Método para crear usuarios temporales (desde formularios anónimos)
  createTemporaryUser(data: CreateTemporaryUserData): Promise<{ id: number }>;
}
