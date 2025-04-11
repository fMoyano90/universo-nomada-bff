import { Injectable } from '@nestjs/common';
import { UserGateway } from '../../../infrastructure/database/gateways/user.gateway';
import { User } from '../../../infrastructure/database/entities/user.entity';
// import { GetUserResponseDTO } from '../dto/user.dto';

@Injectable()
export class GetUserInteractor {
  constructor(private readonly userGateway: UserGateway) {}

  async execute(id?: number): Promise<User | User[]> {
    try {
      if (id) {
        const user = await this.userGateway.findById(id);
        return user;
      } else {
        return this.userGateway.findAll();
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
