import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'; // Import PartialType
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUrl,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  ArrayNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DestinationType } from '../../../infrastructure/database/enums/destination-type.enum'; // Correct path
import { Transform } from 'class-transformer';

// --- Nested DTOs for related entities ---

class ItineraryDetailDTO {
  @ApiProperty({ description: 'Detail text for the itinerary item' })
  @IsString()
  @IsNotEmpty()
  detail: string;
}

class ItineraryItemDTO {
  @ApiProperty({ description: 'Day identifier (e.g., "Day 1", "Día 1")' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  day: string;

  @ApiProperty({ description: 'Title for the itinerary day/item' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    type: [ItineraryDetailDTO],
    description: 'List of details for this itinerary item',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => ItineraryDetailDTO)
  details: ItineraryDetailDTO[];
}

class IncludeDTO {
  @ApiProperty({ description: 'Item included in the destination package' })
  @IsString()
  @IsNotEmpty()
  item: string;
}

class ExcludeDTO {
  @ApiProperty({ description: 'Item excluded from the destination package' })
  @IsString()
  @IsNotEmpty()
  item: string;
}

class TipDTO {
  @ApiProperty({ description: 'Travel tip for the destination' })
  @IsString()
  @IsNotEmpty()
  tip: string;
}

class FaqDTO {
  @ApiProperty({ description: 'Frequently asked question' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'Answer to the frequently asked question' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

class GalleryImageDTO {
  @ApiProperty({ description: 'URL of the gallery image' })
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;
}

// --- Main Create Destination DTO ---

export class CreateDestinationRequestDTO {
  @ApiProperty({ description: 'Title of the destination' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'URL-friendly slug for the destination' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @ApiProperty({ description: 'URL of the main image for the destination' })
  @IsUrl() // Assuming it's a URL, adjust if it's a path or needs file upload handling
  @IsNotEmpty()
  imageSrc: string;

  @ApiProperty({
    description: 'Duration of the trip (e.g., "5 Days / 4 Nights")',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  duration: string;

  @ApiProperty({ description: 'Activity level (e.g., "Moderate", "High")' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  activityLevel: string;

  @ApiProperty({
    description: 'Types of activities (e.g., ["Hiking", "Cultural"])',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @MaxLength(50, { each: true })
  activityType: string[];

  @ApiPropertyOptional({
    description: 'Recommended group size (e.g., "4-8 people")',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  groupSize?: string;

  @ApiProperty({ description: 'Detailed description of the destination' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Price of the destination package' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'General location of the destination (e.g., "Cusco, Peru")',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @ApiPropertyOptional({
    description: 'Is this a recommended destination?',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value, obj }) => {
    // Logs detallados para poder depurar
    console.log('---------- TRANSFORMANDO isRecommended ----------');
    console.log('Valor recibido:', value);
    console.log('Tipo del valor:', typeof value);
    console.log('Valores de FormData:', Object.keys(obj).join(', '));

    // Lista completa de valores considerados como "true"
    const trueCases = [
      true, // booleano true
      'true', // string "true"
      '1', // string "1"
      1, // número 1
      'YES', // para compatibilidad
      'yes',
      'SI',
      'si',
      'Y',
      'y',
      'T',
      't',
      '1000', // para compatibilidad con código anterior
    ];

    // Verificar si el valor está en la lista de casos "true"
    const isTrue = trueCases.includes(value);

    console.log('¿Se considera true?', isTrue);
    console.log('-----------------------------------------------');

    return isTrue;
  })
  isRecommended?: boolean;

  @ApiPropertyOptional({
    description: 'Is this a special offer destination?',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value, obj }) => {
    // Logs detallados para poder depurar
    console.log('---------- TRANSFORMANDO isSpecial ----------');
    console.log('Valor recibido:', value);
    console.log('Tipo del valor:', typeof value);
    console.log('Valores de FormData:', Object.keys(obj).join(', '));

    // Lista completa de valores considerados como "true"
    const trueCases = [
      true, // booleano true
      'true', // string "true"
      '1', // string "1"
      1, // número 1
      'YES', // para compatibilidad
      'yes',
      'SI',
      'si',
      'Y',
      'y',
      'T',
      't',
      '1000', // para compatibilidad con código anterior
    ];

    // Verificar si el valor está en la lista de casos "true"
    const isTrue = trueCases.includes(value);

    console.log('¿Se considera true?', isTrue);
    console.log('-----------------------------------------------');

    return isTrue;
  })
  isSpecial?: boolean;

  @ApiProperty({
    description: 'Type of destination (national or international)',
    enum: DestinationType,
  })
  @IsEnum(DestinationType)
  @IsNotEmpty()
  type: DestinationType;

  @ApiPropertyOptional({
    type: [ItineraryItemDTO],
    description: 'List of itinerary items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => ItineraryItemDTO)
  itineraryItems?: ItineraryItemDTO[];

  @ApiPropertyOptional({
    type: [IncludeDTO],
    description: 'List of included items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => IncludeDTO)
  includes?: IncludeDTO[];

  @ApiPropertyOptional({
    type: [ExcludeDTO],
    description: 'List of excluded items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => ExcludeDTO)
  excludes?: ExcludeDTO[];

  @ApiPropertyOptional({ type: [TipDTO], description: 'List of travel tips' })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => TipDTO)
  tips?: TipDTO[];

  @ApiPropertyOptional({ type: [FaqDTO], description: 'List of FAQs' })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => FaqDTO)
  faqs?: FaqDTO[];

  @ApiPropertyOptional({
    type: [GalleryImageDTO],
    description: 'List of gallery image URLs',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => GalleryImageDTO)
  galleryImages?: GalleryImageDTO[];
}

// --- Update Destination DTO ---
// --- Update Destination DTO ---
// Use PartialType to make all properties of CreateDestinationRequestDTO optional
export class UpdateDestinationRequestDTO extends PartialType(
  CreateDestinationRequestDTO,
) {}

// --- Response DTO (Example - adjust as needed) ---
// You might want a specific response DTO after creation
export class DestinationResponseDTO extends CreateDestinationRequestDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// --- Pagination Meta DTO ---
class PaginationMetaDTO {
  @ApiProperty({ description: 'Total number of items available' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Number of items per page' })
  @IsNumber()
  limit: number;

  @ApiProperty({ description: 'Current page number' })
  @IsNumber()
  page: number;

  @ApiProperty({ description: 'Total number of pages' })
  @IsNumber()
  totalPages: number;
}

// --- Paginated Destinations Response DTO ---
export class PaginatedDestinationsResponseDTO {
  @ApiProperty({
    type: [DestinationResponseDTO],
    description: 'Array of destination data for the current page',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DestinationResponseDTO)
  data: DestinationResponseDTO[];

  @ApiProperty({
    type: PaginationMetaDTO,
    description: 'Pagination metadata',
  })
  @ValidateNested()
  @Type(() => PaginationMetaDTO)
  meta: PaginationMetaDTO;
}
