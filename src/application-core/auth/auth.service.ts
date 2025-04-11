/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserGateway } from '../../infrastructure/database/gateways/user.gateway';
import { SecurityUtils } from '../../common/utils/security.utils';
import { User } from '../../infrastructure/database/entities/user.entity';

interface TokenPayload {
  sub: number;
  email: string;
  role: string;
  jti?: string; // JWT ID for token revocation
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userGateway: UserGateway,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Authenticate a user with email and password
   */
  async validateUser(email: string, password: string): Promise<Partial<User>> {
    this.logger.debug(`Validating user: ${email}`);

    const user = await this.userGateway.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed: User not found: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify user is active
    if (!user.isActive) {
      this.logger.warn(`Login failed: User is inactive: ${email}`);
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await SecurityUtils.comparePasswords(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove sensitive information
    const { passwordHash: _, ...result } = user; // Corrected property name
    return result;
  }

  /**
   * Generate access and refresh tokens
   */
  async login(user: Partial<User>) {
    this.logger.debug(`Generating tokens for user: ${user.email}`);

    // Generate unique token ID for potential revocation
    const jti = SecurityUtils.generateSecureToken(16);

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti,
    };

    // Get token expiration times from config
    const accessTokenExpiration = this.configService.get<string>(
      'JWT_EXPIRATION',
      '1d',
    );
    const refreshTokenExpiration = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessTokenExpiration,
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          expiresIn: refreshTokenExpiration,
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpirationInSeconds(accessTokenExpiration),
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token using a valid refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync<
        TokenPayload & { type: string }
      >(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Validate that this is a refresh token
      if (payload.type !== 'refresh') {
        throw new BadRequestException('Invalid token type');
      }

      // Check if user still exists and is active
      const user = await this.userGateway.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new NotFoundException('User not found or inactive');
      }

      // Generate new tokens
      const { passwordHash: _, ...userData } = user; // Corrected property name
      return this.login(userData);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Utility to convert expiration string (e.g. "1d") to seconds
   */
  private getExpirationInSeconds(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 3600; // Default 1 hour
    }
  }
}
