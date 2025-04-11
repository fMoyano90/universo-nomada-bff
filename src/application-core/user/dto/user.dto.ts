import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  SUPERVISOR = 'supervisor',
}

export class UserNameDTO {
  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;
}

export class UserBaseDTO {
  _id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  phone: string;
  avatar: string;
  password: string;
  role: string;
}

/* Request DTOs */
export class CreateUserRequestDTO {
  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'La contraseña debe contener al menos 1 letra mayúscula, 1 minúscula y 1 número',
  })
  passwordHash: string;

  @ApiPropertyOptional({ description: 'Nombre del usuario' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellido del usuario' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Teléfono del usuario' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}

export class UpdateUserRequestDTO {
  @ApiPropertyOptional({ description: 'Correo electrónico del usuario' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Contraseña del usuario' })
  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'La contraseña debe contener al menos 1 letra mayúscula, 1 minúscula y 1 número',
  })
  passwordHash?: string;

  @ApiPropertyOptional({ description: 'Nombre del usuario' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellido del usuario' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Teléfono del usuario' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Estado activo del usuario' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export type UpdateUserResponseDTO = Partial<UserBaseDTO>;

/* Response DTOs */
export class UserResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
