import { Destination } from '../../infrastructure/database/entities/destination.entity';
import {
  CreateDestinationRequestDTO,
  UpdateDestinationRequestDTO,
} from '../../application-core/destination/dto/destination.dto';
import { DestinationType } from '../../infrastructure/database/enums/destination-type.enum';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

export interface IDestinationGateway {
  create(createDto: CreateDestinationRequestDTO): Promise<Destination>;
  findAll(): Promise<Destination[]>;
  findById(id: number): Promise<Destination | null>;
  findBySlug(slug: string): Promise<Destination | null>;
  update(
    id: number,
    updateDto: UpdateDestinationRequestDTO,
  ): Promise<Destination>;
  delete(id: number): Promise<boolean>;
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
