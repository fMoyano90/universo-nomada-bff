import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
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
import { CreateSubscriptionInteractor } from '../../application-core/subscription/uses-cases/create-subscription.interactor';
import { DeleteSubscriptionInteractor } from '../../application-core/subscription/uses-cases/delete-subscription.interactor';
import { GetPaginatedSubscriptionsInteractor } from '../../application-core/subscription/uses-cases/get-paginated-subscriptions.interactor';
import {
  CreateSubscriptionRequestDTO,
  SubscriptionResponseDTO,
  PaginatedSubscriptionsResponseDTO,
} from '../../application-core/subscription/dto/subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(
    private readonly createSubscriptionInteractor: CreateSubscriptionInteractor,
    private readonly deleteSubscriptionInteractor: DeleteSubscriptionInteractor,
    private readonly getPaginatedSubscriptionsInteractor: GetPaginatedSubscriptionsInteractor,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva suscripción' })
  @ApiResponse({
    status: 201,
    description: 'Suscripción creada exitosamente.',
    type: SubscriptionResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida.' })
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionRequestDTO,
  ): Promise<SubscriptionResponseDTO> {
    this.logger.log(
      `Recibida solicitud para crear suscripción: ${createSubscriptionDto.email}`,
    );
    const subscription = await this.createSubscriptionInteractor.execute(
      createSubscriptionDto,
    );
    return subscription;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una suscripción' })
  @ApiResponse({ status: 204, description: 'Suscripción eliminada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'No encontrado.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Recibida solicitud para eliminar suscripción ID: ${id}`);
    await this.deleteSubscriptionInteractor.execute(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener suscripciones paginadas' })
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
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de suscripciones.',
    type: PaginatedSubscriptionsResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedSubscriptionsResponseDTO> {
    this.logger.log(
      `Recibida solicitud para obtener suscripciones, página: ${page}, límite: ${limit}`,
    );
    return this.getPaginatedSubscriptionsInteractor.execute(page, limit);
  }
}
