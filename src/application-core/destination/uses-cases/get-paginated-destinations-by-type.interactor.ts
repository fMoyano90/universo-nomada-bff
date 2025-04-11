import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway';
import { Destination } from '../../../infrastructure/database/entities/destination.entity';
import { DestinationType } from '../../../infrastructure/database/enums/destination-type.enum';
import {
  PaginationOptions,
  PaginationResult,
} from '../../../common/interfaces/pagination.interface';

@Injectable()
export class GetPaginatedDestinationsByTypeInteractor {
  private readonly logger = new Logger(
    GetPaginatedDestinationsByTypeInteractor.name,
  );

  constructor(private readonly destinationGateway: DestinationGateway) {}

  async execute(
    type: DestinationType,
    options: PaginationOptions, // Use PaginationOptions interface
  ): Promise<PaginationResult<Destination>> {
    this.logger.log(
      `Executing GetPaginatedDestinationsByTypeInteractor for type: ${type} with options: page=${options.page}, limit=${options.limit}`,
    );
    // Pass page and limit correctly from options object
    const paginatedResult = await this.destinationGateway.findPaginatedByType(
      type,
      options.page, // Pass page
      options.limit, // Pass limit
    );

    if (!paginatedResult || paginatedResult.data.length === 0) {
      this.logger.warn(
        `No destinations found for type ${type} with the given pagination options.`,
      );
      // Return an empty result structure instead of throwing an error,
      // as an empty page is a valid result for pagination.
      return {
        data: [],
        total: 0,
        page: options.page,
        limit: options.limit,
        totalPages: 0,
      };
    }

    this.logger.log(
      `Found ${paginatedResult.total} destinations of type ${type}. Returning page ${paginatedResult.page} of ${paginatedResult.totalPages}.`,
    );
    return paginatedResult;
  }
}
