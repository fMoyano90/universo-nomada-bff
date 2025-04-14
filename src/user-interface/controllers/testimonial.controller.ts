import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
  TestimonialResponseDto,
} from '../../application-core/testimonial/dto/testimonial.dto';
import { CreateTestimonialInteractor } from '../../application-core/testimonial/uses-cases/create-testimonial.interactor';
import { FindAllTestimonialsInteractor } from '../../application-core/testimonial/uses-cases/find-all-testimonials.interactor';
import { FindTestimonialByIdInteractor } from '../../application-core/testimonial/uses-cases/find-testimonial-by-id.interactor';
import { UpdateTestimonialInteractor } from '../../application-core/testimonial/uses-cases/update-testimonial.interactor';
import { DeleteTestimonialInteractor } from '../../application-core/testimonial/uses-cases/delete-testimonial.interactor';
import { FindLatestTestimonialsInteractor } from '../../application-core/testimonial/uses-cases/find-latest-testimonials.interactor';
import {
  PaginationOptions,
  // PaginationOptions, // Removed duplicate
  PaginationResult,
} from '../../common/interfaces/pagination.interface';
import { Public } from '../../application-core/auth/decorators/public.decorator'; // Allow public access for GET endpoints
import { Roles } from '../../application-core/auth/decorators/roles.decorator'; // Decorator for role-based access
import { UserRole } from '../../application-core/user/dto/user.dto'; // Corrected Enum import and path
import { PaginatedTestimonialResponseDto } from '../../application-core/testimonial/dto/paginated-testimonial.dto'; // Import specific DTO
// Assuming JwtAuthGuard and RolesGuard are applied globally in app.module

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialController {
  constructor(
    private readonly createTestimonialInteractor: CreateTestimonialInteractor,
    private readonly findAllTestimonialsInteractor: FindAllTestimonialsInteractor,
    private readonly findTestimonialByIdInteractor: FindTestimonialByIdInteractor,
    private readonly updateTestimonialInteractor: UpdateTestimonialInteractor,
    private readonly deleteTestimonialInteractor: DeleteTestimonialInteractor,
    private readonly findLatestTestimonialsInteractor: FindLatestTestimonialsInteractor,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN) // Use correct Enum value
  @ApiBearerAuth() // Indicate that this endpoint requires Bearer token authentication
  @ApiOperation({ summary: 'Create a new testimonial' })
  @ApiResponse({
    status: 201,
    description: 'The testimonial has been successfully created.',
    type: TestimonialResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createTestimonialDto: CreateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    return this.createTestimonialInteractor.execute(createTestimonialDto);
  }

  @Get()
  @Public() // Allow public access to view all testimonials
  @ApiOperation({ summary: 'Get all testimonials with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (e.g., created_at)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'List of testimonials.',
    type: PaginatedTestimonialResponseDto, // Use specific DTO for Swagger
  })
  findAll(
    @Query() paginationOptions: PaginationOptions,
  ): Promise<PaginationResult<TestimonialResponseDto>> {
    return this.findAllTestimonialsInteractor.execute(paginationOptions);
  }

  @Get('latest')
  @Public() // Allow public access to view latest testimonials
  @ApiOperation({ summary: 'Get the latest testimonials' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of latest testimonials to retrieve (default: 6)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of latest testimonials.',
    type: [TestimonialResponseDto],
  })
  findLatest(
    // Removed ParseIntPipe for optional query param, validation/default handled in interactor
    @Query('limit') limit?: number,
  ): Promise<TestimonialResponseDto[]> {
    // Interactor handles default limit if undefined
    return this.findLatestTestimonialsInteractor.execute(limit);
  }

  @Get(':id')
  @Public() // Allow public access to view a single testimonial
  @ApiOperation({ summary: 'Get a testimonial by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found testimonial.',
    type: TestimonialResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Testimonial not found.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TestimonialResponseDto> {
    return this.findTestimonialByIdInteractor.execute(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN) // Use correct Enum value
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a testimonial by ID' })
  @ApiResponse({
    status: 200,
    description: 'The testimonial has been successfully updated.',
    type: TestimonialResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Testimonial not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    return this.updateTestimonialInteractor.execute(id, updateTestimonialDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Use correct Enum value
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 No Content on successful deletion
  @ApiOperation({ summary: 'Delete a testimonial by ID' })
  @ApiResponse({
    status: 204,
    description: 'The testimonial has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Testimonial not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deleteTestimonialInteractor.execute(id);
  }
}
