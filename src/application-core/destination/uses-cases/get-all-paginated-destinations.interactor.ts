import { Injectable, Logger } from '@nestjs/common';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway';
import { Destination } from '../../../infrastructure/database/entities/destination.entity';
import { PaginatedDestinationsResponseDTO } from '../dto/destination.dto'; // Importar el DTO de respuesta

interface PaginationOptions {
  page: number;
  limit: number;
}

// Define la estructura esperada del resultado del gateway
interface PaginatedGatewayResult {
  data: Destination[];
  total: number;
}

@Injectable()
export class GetAllPaginatedDestinationsInteractor {
  private readonly logger = new Logger(
    GetAllPaginatedDestinationsInteractor.name,
  );

  constructor(private readonly destinationGateway: DestinationGateway) {}

  async execute(
    options: PaginationOptions,
  ): Promise<PaginatedDestinationsResponseDTO> {
    this.logger.log(
      `Executing GetAllPaginatedDestinationsInteractor with options: ${JSON.stringify(
        options,
      )}`,
    );

    try {
      const { page, limit } = options;

      // Llamar al gateway para obtener datos paginados
      // Asume que el gateway tiene un método como findAllPaginated
      const result: PaginatedGatewayResult =
        await this.destinationGateway.findAllPaginated({ page, limit });

      const total = result.total;
      const totalPages = Math.ceil(total / limit);

      // Construir el objeto de respuesta
      const response: PaginatedDestinationsResponseDTO = {
        data: result.data, // Los destinos ya están en el formato correcto (asumiendo)
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };

      this.logger.log(
        `Successfully fetched ${result.data.length} destinations for page ${page}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch paginated destinations: ${error.message}`,
        error.stack,
      );
      // Re-lanzar el error para que sea manejado por capas superiores
      throw error;
    }
  }
}
