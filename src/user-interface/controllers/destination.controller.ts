import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateDestinationInteractor } from '../../application-core/destination/uses-cases/create-destination.interactor';
import {
  CreateDestinationRequestDTO,
  DestinationResponseDTO,
} from '../../application-core/destination/dto/destination.dto';
import { JwtAuthGuard } from '../../application-core/auth/guards/jwt-auth.guard'; // Assuming JWT protection
import { RolesGuard } from '../../application-core/auth/guards/roles.guard'; // Assuming Role protection
import { Roles } from '../../application-core/auth/decorators/roles.decorator'; // Assuming Role protection
import { UserRole } from '../../application-core/user/dto/user.dto'; // Assuming UserRole enum exists

@ApiTags('Destinations')
@ApiBearerAuth() // Indicates that JWT authentication is required
@Controller('destinations')
export class DestinationController {
  private readonly logger = new Logger(DestinationController.name);

  constructor(
    private readonly createDestinationInteractor: CreateDestinationInteractor, // Inject other interactors (Get, Update, Delete) here when created
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards for authentication and authorization
  @Roles(UserRole.ADMIN) // Only allow Admins to create destinations
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new destination' })
  @ApiResponse({
    status: 201,
    description: 'The destination has been successfully created.',
    type: DestinationResponseDTO, // Use the response DTO for Swagger documentation
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have the required role.',
  })
  async create(
    @Body() createDestinationDto: CreateDestinationRequestDTO,
  ): Promise<DestinationResponseDTO> {
    // Return the response DTO
    this.logger.log(
      `Received request to create destination: ${createDestinationDto.title}`,
    );
    // The interactor returns the full Destination entity
    const destinationEntity = await this.createDestinationInteractor.execute(
      createDestinationDto,
    );

    // Map the created entity to the response DTO before sending it back
    // This ensures we only expose the fields defined in the DTO
    const responseDto: DestinationResponseDTO = {
      ...destinationEntity, // Spread properties from the entity
      // Ensure all properties from DestinationResponseDTO are present
      // If entity properties don't directly match DTO, map them explicitly here
      // Example: responseDto.someDtoField = destinationEntity.someEntityField
    };

    this.logger.log(
      `Destination created successfully with ID: ${responseDto.id}`,
    );
    return responseDto;
  }

  // Add GET, PUT, DELETE endpoints here later
}
