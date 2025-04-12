import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateSliderDTO,
  UpdateSliderDTO,
  ReorderSliderDTO,
} from '../../application-core/slider/dto/slider.dto';
import { CreateSliderInteractor } from '../../application-core/slider/uses-cases/create-slider.interactor';
import { DeleteSliderInteractor } from '../../application-core/slider/uses-cases/delete-slider.interactor';
import { GetSlidersInteractor } from '../../application-core/slider/uses-cases/get-sliders.interactor';
import { UpdateSliderInteractor } from '../../application-core/slider/uses-cases/update-slider.interactor';
import { ReorderSliderInteractor } from '../../application-core/slider/uses-cases/reorder-slider.interactor';
import { JwtAuthGuard } from '../../application-core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../application-core/auth/guards/roles.guard';
import { Roles } from '../../application-core/auth/decorators/roles.decorator';
import { UserRole } from '../../application-core/user/dto/user.dto';
import { Public } from '../../application-core/auth/decorators/public.decorator';

@ApiTags('Sliders')
@Controller('api/v1/sliders')
export class SliderController {
  constructor(
    private readonly getSlidersInteractor: GetSlidersInteractor,
    private readonly createSliderInteractor: CreateSliderInteractor,
    private readonly updateSliderInteractor: UpdateSliderInteractor,
    private readonly deleteSliderInteractor: DeleteSliderInteractor,
    private readonly reorderSliderInteractor: ReorderSliderInteractor,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all sliders' })
  @ApiResponse({ status: 200, description: 'Return all sliders.' })
  async findAll() {
    return this.getSlidersInteractor.execute();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new slider' })
  @ApiResponse({ status: 201, description: 'The slider has been created.' })
  async create(@Body() createSliderDto: CreateSliderDTO) {
    return this.createSliderInteractor.execute(createSliderDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a slider' })
  @ApiResponse({ status: 200, description: 'The slider has been updated.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSliderDto: UpdateSliderDTO,
  ) {
    return this.updateSliderInteractor.execute(id, updateSliderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a slider' })
  @ApiResponse({ status: 200, description: 'The slider has been deleted.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.deleteSliderInteractor.execute(id);
  }

  @Put(':id/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reorder a slider' })
  @ApiResponse({ status: 200, description: 'The slider has been reordered.' })
  async reorder(
    @Param('id', ParseIntPipe) id: number,
    @Body() reorderDto: ReorderSliderDTO,
  ) {
    return this.reorderSliderInteractor.execute(id, reorderDto.direction);
  }
}
