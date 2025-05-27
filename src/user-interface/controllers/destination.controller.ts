import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Param,
  ParseIntPipe,
  Put,
  Patch, // Added Patch
  Delete,
  Get, // Added Get
  ParseEnumPipe, // Added ParseEnumPipe
  Query, // Added Query
  DefaultValuePipe, // Added DefaultValuePipe
  Req, // Added Req
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam, // Added ApiParam
  ApiQuery, // Added ApiQuery
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateDestinationInteractor } from '../../application-core/destination/uses-cases/create-destination.interactor';
import { UpdateDestinationInteractor } from '../../application-core/destination/uses-cases/update-destination.interactor';
import { DeleteDestinationInteractor } from '../../application-core/destination/uses-cases/delete-destination.interactor';
import { GetLatestSpecialDestinationInteractor } from '../../application-core/destination/uses-cases/get-latest-special-destination.interactor';
import { GetRecommendedDestinationsInteractor } from '../../application-core/destination/uses-cases/get-recommended-destinations.interactor'; // Added GetRecommended Interactor
import { GetPaginatedDestinationsByTypeInteractor } from '../../application-core/destination/uses-cases/get-paginated-destinations-by-type.interactor'; // Added GetPaginated Interactor
import { GetLatestDestinationsInteractor } from '../../application-core/destination/uses-cases/get-latest-destinations.interactor';
import { GetDestinationByIdInteractor } from '../../application-core/destination/uses-cases/get-destination-by-id.interactor';
import { GetAllPaginatedDestinationsInteractor } from '../../application-core/destination/uses-cases/get-all-paginated-destinations.interactor'; // <- NUEVA IMPORTACIÓN
import {
  CreateDestinationRequestDTO,
  UpdateDestinationRequestDTO,
  DestinationResponseDTO,
  PaginatedDestinationsResponseDTO, // Added Paginated DTO
} from '../../application-core/destination/dto/destination.dto';
import { JwtAuthGuard } from '../../application-core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../application-core/auth/guards/roles.guard';
import { Roles } from '../../application-core/auth/decorators/roles.decorator';
import { UserRole } from '../../application-core/user/dto/user.dto';
import { Public } from '../../application-core/auth/decorators/public.decorator';
import { DestinationType } from '../../infrastructure/database/enums/destination-type.enum'; // Added DestinationType enum

@ApiTags('Destinations')
@Controller('destinations')
export class DestinationController {
  private readonly logger = new Logger(DestinationController.name);

  constructor(
    private readonly createDestinationInteractor: CreateDestinationInteractor,
    private readonly updateDestinationInteractor: UpdateDestinationInteractor,
    private readonly deleteDestinationInteractor: DeleteDestinationInteractor,
    private readonly getLatestSpecialDestinationInteractor: GetLatestSpecialDestinationInteractor,
    private readonly getRecommendedDestinationsInteractor: GetRecommendedDestinationsInteractor, // Injected GetRecommended Interactor
    private readonly getPaginatedDestinationsByTypeInteractor: GetPaginatedDestinationsByTypeInteractor, // Injected GetPaginated Interactor
    private readonly getLatestDestinationsInteractor: GetLatestDestinationsInteractor,
    private readonly getDestinationByIdInteractor: GetDestinationByIdInteractor,
    private readonly getAllPaginatedDestinationsInteractor: GetAllPaginatedDestinationsInteractor, // <- NUEVO INTERACTOR INYECTADO
  ) {}

  // Método auxiliar para extraer existingGalleryImages del rawBody
  private extractExistingGalleryImages(
    rawBody: any,
  ): { imageUrl: string }[] | undefined {
    const existingImages: { imageUrl: string }[] = [];

    // Buscar campos que coincidan con el patrón existingGalleryImages[index][imageUrl]
    for (const key in rawBody) {
      const match = key.match(/^existingGalleryImages\[(\d+)\]\[imageUrl\]$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const imageUrl = rawBody[key];
        if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
          existingImages[index] = { imageUrl: imageUrl.trim() };
        }
      }
    }

    // Filtrar elementos undefined y devolver solo si hay imágenes válidas
    const validImages = existingImages.filter((img) => img && img.imageUrl);
    return validImages.length > 0 ? validImages : undefined;
  }

  @Post()
  @ApiBearerAuth() // Requires auth
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new destination' })
  @ApiOkResponse({ type: DestinationResponseDTO })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageSrc', maxCount: 1 },
      { name: 'galleryImages', maxCount: 10 },
    ]),
  )
  async createDestination(
    @Body() createDestinationDto: CreateDestinationRequestDTO,
    @UploadedFiles()
    files: {
      imageSrc?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
    @Req() req: any, // Obtener acceso directo a la solicitud
  ) {
    // Mostrar los valores recibidos pero SIN MODIFICARLOS
    this.logger.log(
      `[CONTROLLER] Form data completo: ${JSON.stringify(
        createDestinationDto,
      )}`,
    );

    // Acceder directamente a los valores originales del cuerpo de la solicitud
    const rawBody = req.body || {};

    this.logger.log(`[CONTROLLER] Valores originales:`);
    this.logger.log(`isRecommended original: ${rawBody.isRecommended}`);
    this.logger.log(`isSpecial original: ${rawBody.isSpecial}`);

    // Corregir manualmente los valores booleanos basados en los valores originales
    if (rawBody.isRecommended) {
      const shouldBeTrue =
        rawBody.isRecommended === '1' ||
        rawBody.isRecommended === 'true' ||
        rawBody.isRecommended === 1;
      createDestinationDto.isRecommended = shouldBeTrue;
      this.logger.log(
        `[CONTROLLER] Corrigiendo isRecommended a: ${shouldBeTrue}`,
      );
    }

    if (rawBody.isSpecial !== undefined) {
      const shouldBeTrue =
        rawBody.isSpecial === '1' ||
        rawBody.isSpecial === 'true' ||
        rawBody.isSpecial === 1;
      createDestinationDto.isSpecial = shouldBeTrue;
      this.logger.log(`[CONTROLLER] Corrigiendo isSpecial a: ${shouldBeTrue}`);
    }

    const imageSrcFile = files.imageSrc?.[0];
    const galleryImageFiles = files.galleryImages || [];
    const destinationEntity = await this.createDestinationInteractor.execute(
      createDestinationDto,
      imageSrcFile,
      galleryImageFiles,
    );
    const responseDto: DestinationResponseDTO = { ...destinationEntity };
    this.logger.log(
      `Destination created successfully with ID: ${responseDto.id}`,
    );
    return responseDto;
  }

  @Patch(':id')
  @ApiBearerAuth() // Requires auth
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Partially update an existing destination' })
  @ApiParam({ name: 'id', description: 'Destination ID', type: 'number' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageSrc', maxCount: 1 },
      { name: 'galleryImages', maxCount: 10 },
    ]),
  )
  @ApiResponse({
    status: 200,
    description: 'Destination updated.',
    type: DestinationResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async updateDestination(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDestinationDto: UpdateDestinationRequestDTO,
    @UploadedFiles()
    files: {
      imageSrc?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
    @Req() req: any, // Obtener acceso directo a la solicitud
  ) {
    this.logger.log(`Received request to update destination ID: ${id}`);

    // Acceder directamente a los valores originales del cuerpo de la solicitud
    const rawBody = req.body || {};

    this.logger.log(`[CONTROLLER UPDATE] Valores originales:`);
    this.logger.log(`isRecommended original: ${rawBody.isRecommended}`);
    this.logger.log(`isSpecial original: ${rawBody.isSpecial}`);

    // Corregir manualmente los valores booleanos basados en los valores originales
    if (rawBody.isRecommended) {
      const shouldBeTrue =
        rawBody.isRecommended === '1' ||
        rawBody.isRecommended === 'true' ||
        rawBody.isRecommended === 1;
      updateDestinationDto.isRecommended = shouldBeTrue;
      this.logger.log(
        `[CONTROLLER UPDATE] Corrigiendo isRecommended a: ${shouldBeTrue}`,
      );
    }

    if (rawBody.isSpecial !== undefined) {
      const shouldBeTrue =
        rawBody.isSpecial === '1' ||
        rawBody.isSpecial === 'true' ||
        rawBody.isSpecial === 1;
      updateDestinationDto.isSpecial = shouldBeTrue;
      this.logger.log(
        `[CONTROLLER UPDATE] Corrigiendo isSpecial a: ${shouldBeTrue}`,
      );
    }

    // Extraer existingGalleryImages del rawBody si existe
    const existingGalleryImages = this.extractExistingGalleryImages(rawBody);

    // Verificar si se quiere limpiar la galería completamente
    const clearGallery = rawBody.clearGallery === 'true';

    const imageSrcFile = files.imageSrc?.[0];
    const galleryImageFiles = files.galleryImages || [];
    const updatedDestinationEntity =
      await this.updateDestinationInteractor.execute(
        id,
        updateDestinationDto,
        imageSrcFile,
        galleryImageFiles,
      );
    const responseDto: DestinationResponseDTO = {
      ...updatedDestinationEntity,
      // Explicit mapping if needed
    };
    this.logger.log(`Destination ID: ${id} updated successfully.`);
    return responseDto;
  }

  @Delete(':id')
  @ApiBearerAuth() // Requires auth
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a destination' })
  @ApiResponse({ status: 204, description: 'Destination deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Received request to delete destination ID: ${id}`);
    await this.deleteDestinationInteractor.execute(id);
    this.logger.log(`Destination ID: ${id} deleted successfully.`);
  }

  // --- Public Endpoint ---
  @Public() // Make this endpoint public
  @Get('special/latest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the latest special destination' })
  @ApiResponse({
    status: 200,
    description: 'Latest special destination.',
    type: DestinationResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'No special destination found.',
  })
  async getLatestSpecial(): Promise<DestinationResponseDTO> {
    this.logger.log('Received request for latest special destination');
    const destinationEntity =
      await this.getLatestSpecialDestinationInteractor.execute();
    // Map entity to response DTO (simple spread works if DTO matches entity structure)
    const responseDto: DestinationResponseDTO = { ...destinationEntity };
    return responseDto;
  }

  // --- Public Endpoint for Recommended Destinations ---
  @Public() // Make this endpoint public
  @Get('recommended/:type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get top 3 recommended destinations by type' })
  @ApiParam({
    name: 'type',
    required: true,
    description: 'The type of destination to get recommendations for',
    enum: DestinationType,
  })
  @ApiResponse({
    status: 200,
    description: 'List of recommended destinations.',
    type: [DestinationResponseDTO], // Returns an array
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid destination type provided.',
  })
  async getRecommendedByType(
    @Param('type', new ParseEnumPipe(DestinationType)) type: DestinationType,
  ): Promise<DestinationResponseDTO[]> {
    this.logger.log(
      `Received request for recommended destinations of type: ${type}`,
    );
    const destinations =
      await this.getRecommendedDestinationsInteractor.execute(type);
    // Map entities to response DTOs
    const responseDtos: DestinationResponseDTO[] = destinations.map(
      (dest) => ({ ...dest }), // Simple spread assuming DTO matches entity
    );
    return responseDtos;
  }

  // --- Public Endpoint for Paginated Destinations by Type ---
  @Public()
  @Get('type/:type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get paginated destinations by type' })
  @ApiParam({
    name: 'type',
    required: true,
    description: 'The type of destination to fetch',
    enum: DestinationType,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of destinations.',
    type: PaginatedDestinationsResponseDTO, // Use the specific paginated DTO
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid destination type or pagination parameters.',
  })
  async getPaginatedByType(
    @Param('type', new ParseEnumPipe(DestinationType)) type: DestinationType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedDestinationsResponseDTO> {
    this.logger.log(
      `Received request for paginated destinations of type: ${type}, page: ${page}, limit: ${limit}`,
    );

    // Ensure limit is within reasonable bounds if necessary
    limit = Math.min(limit, 100); // Example: Max 100 items per page

    // Pass page and limit as a single options object
    const options = { page, limit };
    const paginatedResult =
      await this.getPaginatedDestinationsByTypeInteractor.execute(
        type,
        options,
      );

    // Map data items if needed (assuming DestinationResponseDTO matches Destination entity structure for now)
    const response: PaginatedDestinationsResponseDTO = {
      data: paginatedResult.data.map((dest) => ({ ...dest })), // Simple spread
      meta: {
        // Nest pagination info inside meta object
        total: paginatedResult.total,
        page: paginatedResult.page,
        limit: paginatedResult.limit,
        totalPages: paginatedResult.totalPages,
      },
    };

    return response;
  }

  @Public()
  @Get('latest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener los últimos destinos agregados' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de destinos a retornar',
    type: Number,
    example: 6,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de los últimos destinos.',
    type: [DestinationResponseDTO],
  })
  async getLatest(
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ): Promise<DestinationResponseDTO[]> {
    this.logger.log(
      `Recibida solicitud para obtener los últimos ${limit} destinos`,
    );
    const destinations = await this.getLatestDestinationsInteractor.execute(
      limit,
    );
    const responseDtos: DestinationResponseDTO[] = destinations.map((dest) => ({
      ...dest,
    }));
    return responseDtos;
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un destino por ID' })
  @ApiResponse({
    status: 200,
    description: 'Destino encontrado.',
    type: DestinationResponseDTO,
  })
  @ApiResponse({ status: 404, description: 'Destino no encontrado.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DestinationResponseDTO> {
    this.logger.log(`Recibida solicitud para obtener destino ID: ${id}`);
    return this.getDestinationByIdInteractor.execute(id);
  }

  // <<< NUEVO MÉTODO para obtener TODOS los destinos paginados >>>
  @Public()
  @Get() // Usamos GET /destinations para la lista paginada general
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all destinations paginated' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of all destinations.',
    type: PaginatedDestinationsResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Invalid pagination parameters.' })
  async getAllPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedDestinationsResponseDTO> {
    this.logger.log(
      `Received request for ALL paginated destinations, page: ${page}, limit: ${limit}`,
    );

    limit = Math.min(limit, 100); // Limitar razonablemente
    const options = { page, limit };
    const paginatedResult =
      await this.getAllPaginatedDestinationsInteractor.execute(options);

    // Corregir el mapeo: Acceder a las propiedades a través de 'meta'
    const response: PaginatedDestinationsResponseDTO = {
      data: paginatedResult.data.map((dest) => ({ ...dest })),
      meta: {
        total: paginatedResult.meta.total, // <- CORREGIDO
        page: paginatedResult.meta.page, // <- CORREGIDO
        limit: paginatedResult.meta.limit, // <- CORREGIDO
        totalPages: paginatedResult.meta.totalPages, // <- CORREGIDO
      },
    };

    return response;
  }
  // <<< FIN NUEVO MÉTODO >>>
}
