import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token de refresco' })
  @IsString({ message: 'El token debe ser un texto' })
  @IsNotEmpty({ message: 'El token es requerido' })
  refreshToken: string;
}
