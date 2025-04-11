import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserGateway } from '../../../infrastructure/database/gateways/user.gateway';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userGateway: UserGateway,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Convertir sub a número cuando sea necesario
    const userId =
      typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;

    // Find the user in the database to ensure they still exist
    const user = await this.userGateway.findById(userId);

    // Return a user object to be added to the request
    return {
      userId,
      email: payload.email,
      role: payload.role,
      isActive: user?.isActive || false,
    };
  }
}
