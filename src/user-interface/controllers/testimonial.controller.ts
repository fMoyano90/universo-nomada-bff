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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
  PaginationResult,
} from '../../common/interfaces/pagination.interface';
import { Public } from '../../application-core/auth/decorators/public.decorator';
import { Roles } from '../../application-core/auth/decorators/roles.decorator';
import { UserRole } from '../../application-core/user/dto/user.dto';
import { PaginatedTestimonialResponseDto } from '../../application-core/testimonial/dto/paginated-testimonial.dto';
import { multerConfig } from '../utils/multer.config';
import { UploadService } from '../services/upload.service';

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
    private readonly uploadService: UploadService,
  ) {}

  @Post('upload')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a testimonial image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully uploaded.',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        filename: { type: 'string' },
        mimetype: { type: 'string' },
        size: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadImage(file, 'testimonials');
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new testimonial' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiResponse({
    status: 201,
    description: 'The testimonial has been successfully created.',
    type: TestimonialResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<TestimonialResponseDto> {
    const imageUrl = image
      ? (await this.uploadService.uploadImage(image, 'testimonials')).url
      : createTestimonialDto.image_url || '';

    // Añadir la URL de la imagen al DTO
    const testimonialData = {
      ...createTestimonialDto,
      image_url: imageUrl,
    };

    return this.createTestimonialInteractor.execute(testimonialData);
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
    @Query('limit') limit?: number,
  ): Promise<TestimonialResponseDto[]> {
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
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a testimonial by ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiResponse({
    status: 200,
    description: 'The testimonial has been successfully updated.',
    type: TestimonialResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Testimonial not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<TestimonialResponseDto> {
    const imageUrl = image
      ? (await this.uploadService.uploadImage(image, 'testimonials')).url
      : null;

    // Añadir la URL de la imagen al DTO solo si se ha proporcionado una nueva imagen
    const testimonialData = {
      ...updateTestimonialDto,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    };

    return this.updateTestimonialInteractor.execute(id, testimonialData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
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
