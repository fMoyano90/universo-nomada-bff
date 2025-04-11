import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserGateway } from '../../../infrastructure/database/gateways/user.gateway';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../../infrastructure/database/entities/user.entity';

@Injectable()
export class AuthInteractor {
  constructor(
    private userGateway: UserGateway,
    private jwtService: JwtService,
  ) {}

  // Note: This validateUser seems redundant with AuthService.validateUser
  // Consider consolidating logic if appropriate for the application architecture.
  async validateUser(email: string, pass: string): Promise<Partial<User>> {
    const user = await this.userGateway.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Contraseña o usuario invalido');
    }
    const passwordValid = await bcrypt.compare(pass, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Contraseña o usuario invalido');
    }
    // Return user data without the hash
    const { passwordHash: _, ...result } = user;
    return result;
  }

  // This login method seems different from AuthService.login.
  // It generates a simpler token. Ensure this aligns with application needs.
  async login(user: Partial<User>) {
    // Assuming 'user' is the validated user object without passwordHash
    const payload = {
      username: `${user.firstName || ''} ${user.lastName || ''}`.trim(), // Use updated fields
      sub: user.id, // Use id
      email: user.email,
      role: user.role,
      // avatar is removed
    };
    return {
      access_token: this.jwtService.sign(payload), // Consider using signAsync and configuring secrets/expiration like in AuthService
    };
  }
}
