import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slider } from '../../infrastructure/database/entities/slider.entity';
import { SliderGateway } from '../../infrastructure/database/gateways/slider.gateway';
import { CreateSliderInteractor } from './uses-cases/create-slider.interactor';
import { DeleteSliderInteractor } from './uses-cases/delete-slider.interactor';
import { GetSlidersInteractor } from './uses-cases/get-sliders.interactor';
import { UpdateSliderInteractor } from './uses-cases/update-slider.interactor';
import { ReorderSliderInteractor } from './uses-cases/reorder-slider.interactor';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
@Module({
  imports: [TypeOrmModule.forFeature([Slider]), InfrastructureModule],
  controllers: [],
  providers: [
    SliderGateway,
    CreateSliderInteractor,
    DeleteSliderInteractor,
    GetSlidersInteractor,
    UpdateSliderInteractor,
    ReorderSliderInteractor,
  ],
  exports: [
    CreateSliderInteractor,
    DeleteSliderInteractor,
    GetSlidersInteractor,
    UpdateSliderInteractor,
    ReorderSliderInteractor,
  ],
})
export class SliderModule {}
