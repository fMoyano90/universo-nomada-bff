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
  Delete,
  Get, // Added Get
  ParseEnumPipe, // Added ParseEnumPipe
  Query, // Added Query
  DefaultValuePipe, // Added DefaultValuePipe
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
} from '@nestjs/swagger';
import { CreateDestinationInteractor } from '../../application-core/destination/uses-cases/create-destination.interactor';
import { UpdateDestinationInteractor } from '../../application-core/destination/uses-cases/update-destination.interactor';
import { DeleteDestinationInteractor } from '../../application-core/destination/uses-cases/delete-destination.interactor';
import { GetLatestSpecialDestinationInteractor } from '../../application-core/destination/uses-cases/get-latest-special-destination.interactor';
import { GetRecommendedDestinationsInteractor } from '../../application-core/destination/uses-cases/get-recommended-destinations.interactor'; // Added GetRecommended Interactor
import { GetPaginatedDestinationsByTypeInteractor } from '../../application-core/destination/uses-cases/get-paginated-destinations-by-type.interactor'; // Added GetPaginated Interactor
import { GetLatestDestinationsInteractor } from '../../application-core/destination/uses-cases/get-latest-destinations.interactor';
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
  ) {}

  @Post()
  @ApiBearerAuth() // Requires auth
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new destination with image uploads' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageSrc', maxCount: 1 },
      { name: 'galleryImages', maxCount: 10 },
    ]),
  )
  @ApiResponse({
    status: 201,
    description: 'The destination has been successfully created.',
    type: DestinationResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(
    @UploadedFiles()
    files: {
      imageSrc?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
    @Body() createDestinationDto: CreateDestinationRequestDTO,
  ): Promise<DestinationResponseDTO> {
    this.logger.log(
      `Received request to create destination: ${createDestinationDto.title} with files`,
    );
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

  @Put(':id')
  @ApiBearerAuth() // Requires auth
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing destination' })
  @ApiConsumes('multipart/form-data')
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      imageSrc?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
    @Body() updateDestinationDto: UpdateDestinationRequestDTO,
  ): Promise<DestinationResponseDTO> {
    this.logger.log(`Received request to update destination ID: ${id}`);
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

  // Add other GET endpoints here later (e.g., get all, get by ID)
}
