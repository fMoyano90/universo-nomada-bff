import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateSliderDTO {
  @ApiProperty({ description: 'Título del slider' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Subtítulo del slider' })
  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @ApiProperty({ description: 'Ubicación que se muestra en el slider' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'URL de la imagen del slider' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Texto del botón' })
  @IsString()
  @IsOptional()
  buttonText?: string;

  @ApiPropertyOptional({ description: 'URL del botón' })
  @IsString()
  @IsOptional()
  buttonUrl?: string;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo del slider' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Orden de visualización' })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateSliderDTO extends CreateSliderDTO {}

export class ReorderSliderDTO {
  @ApiProperty({ description: 'Dirección del reordenamiento (up/down)' })
  @IsString()
  @IsNotEmpty()
  direction: 'up' | 'down';
}
