import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../application-core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../application-core/auth/guards/roles.guard';
import { Roles } from '../../application-core/auth/decorators/roles.decorator';
import { UserRole } from '../../application-core/user/dto/user.dto';
import { GetPaginatedBookingsInteractor } from '../../application-core/booking/uses-cases/get-paginated-bookings.interactor';
import { GetBookingByIdInteractor } from '../../application-core/booking/uses-cases/get-booking-by-id.interactor';
import { UpdateBookingStatusInteractor } from '../../application-core/booking/uses-cases/update-booking-status.interactor';
import { CreateQuoteInteractor } from '../../application-core/booking/uses-cases/create-quote.interactor';
import {
  UpdateBookingStatusDTO,
  BookingResponseDTO,
  PaginatedBookingsResponseDTO,
  BookingFiltersDTO,
  CreateQuoteDTO,
} from '../../application-core/booking/dto/booking.dto';
import {
  BookingStatus,
  BookingType,
} from '../../infrastructure/database/entities/booking.entity';
import { Public } from '../../application-core/auth/decorators/public.decorator';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(
    private readonly getPaginatedBookingsInteractor: GetPaginatedBookingsInteractor,
    private readonly getBookingByIdInteractor: GetBookingByIdInteractor,
    private readonly updateBookingStatusInteractor: UpdateBookingStatusInteractor,
    private readonly createQuoteInteractor: CreateQuoteInteractor,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener reservas paginadas' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado de la reserva',
    enum: BookingStatus,
  })
  @ApiQuery({
    name: 'bookingType',
    required: false,
    description: 'Filtrar por tipo de reserva',
    enum: BookingType,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de reservas.',
    type: PaginatedBookingsResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: BookingStatus,
    @Query('bookingType') bookingType?: BookingType,
  ): Promise<PaginatedBookingsResponseDTO> {
    this.logger.log(
      `Recibida solicitud para obtener reservas, página: ${page}, límite: ${limit}, estado: ${status}, tipo: ${bookingType}`,
    );

    const filters: BookingFiltersDTO = {
      ...(status && { status }),
      ...(bookingType && { bookingType }),
    };

    return this.getPaginatedBookingsInteractor.execute(page, limit, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiResponse({
    status: 200,
    description: 'Reserva encontrada.',
    type: BookingResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'No encontrado.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BookingResponseDTO> {
    this.logger.log(`Recibida solicitud para obtener reserva ID: ${id}`);
    return this.getBookingByIdInteractor.execute(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de una reserva' })
  @ApiResponse({
    status: 200,
    description: 'Estado de reserva actualizado.',
    type: BookingResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'No encontrado.' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateBookingStatusDTO,
  ): Promise<BookingResponseDTO> {
    this.logger.log(
      `Recibida solicitud para actualizar estado de reserva ID: ${id}`,
    );
    return this.updateBookingStatusInteractor.execute(id, updateStatusDto);
  }

  @Post('quote')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una cotización' })
  @ApiResponse({
    status: 201,
    description: 'Cotización creada con éxito.',
    type: BookingResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida.' })
  async createQuote(
    @Body() createQuoteDto: CreateQuoteDTO,
    @Request() req,
  ): Promise<BookingResponseDTO> {
    this.logger.log(
      `Recibida solicitud para crear cotización para destino: ${createQuoteDto.destinationId}`,
    );

    // Obtener el ID del usuario si está autenticado
    const userId = req.user?.id;

    return this.createQuoteInteractor.execute(createQuoteDto, userId);
  }
}
