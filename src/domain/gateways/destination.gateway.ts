import { Destination } from '../../infrastructure/database/entities/destination.entity';
import {
  CreateDestinationRequestDTO,
  UpdateDestinationRequestDTO,
} from '../../application-core/destination/dto/destination.dto';
import { DestinationType } from '../../infrastructure/database/enums/destination-type.enum';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

export interface DestinationResponseDTO {
  id: number;
  name: string;
  slug: string;
  country: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDestinationGateway {
  create(
    data: Partial<DestinationResponseDTO>,
  ): Promise<DestinationResponseDTO>;
  findAll(options?: { featured?: boolean }): Promise<DestinationResponseDTO[]>;
  findById(id: number): Promise<DestinationResponseDTO | null>;
  findBySlug(slug: string): Promise<DestinationResponseDTO | null>;
  update(
    id: number,
    data: Partial<DestinationResponseDTO>,
  ): Promise<DestinationResponseDTO>;
  delete(id: number): Promise<void>;
  findLatest(limit: number): Promise<Destination[]>;
  findLatestSpecial(): Promise<Destination | null>;
  findRecommendedByType(
    type: DestinationType,
    limit: number,
  ): Promise<Destination[]>;
  findPaginatedByType(
    type: DestinationType,
    page: number,
    limit: number,
  ): Promise<PaginationResult<Destination>>;
}
