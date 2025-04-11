import { Injectable, Logger } from '@nestjs/common';
import { UserGateway } from '../../../infrastructure/database/gateways/user.gateway';

@Injectable()
export class DeleteUserInteractor {
  private logger = new Logger('DeleteUserInteractor');

  constructor(private readonly userGateway: UserGateway) {}

  async execute(id: number): Promise<boolean> {
    try {
      const user = await this.userGateway.delete(id);
      return user;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
