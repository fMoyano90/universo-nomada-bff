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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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
@Controller('/sliders')
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
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new slider' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        location: { type: 'string' },
        imageUrl: { type: 'string', nullable: true },
        buttonText: { type: 'string', nullable: true },
        buttonUrl: { type: 'string', nullable: true },
        isActive: { type: 'boolean', nullable: true },
        displayOrder: { type: 'number', nullable: true },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del slider',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The slider has been created.' })
  async create(
    @Body() createSliderDto: CreateSliderDTO,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.createSliderInteractor.execute(createSliderDto, imageFile);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        location: { type: 'string' },
        imageUrl: { type: 'string', nullable: true },
        buttonText: { type: 'string', nullable: true },
        buttonUrl: { type: 'string', nullable: true },
        isActive: { type: 'boolean', nullable: true },
        displayOrder: { type: 'number', nullable: true },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del slider',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update a slider' })
  @ApiResponse({ status: 200, description: 'The slider has been updated.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSliderDto: UpdateSliderDTO,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.updateSliderInteractor.execute(id, updateSliderDto, imageFile);
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
