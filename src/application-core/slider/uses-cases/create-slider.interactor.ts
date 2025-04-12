import { Injectable } from '@nestjs/common';
import { SliderGateway } from '../../../infrastructure/database/gateways/slider.gateway';
import { CreateSliderDTO } from '../dto/slider.dto';

@Injectable()
export class CreateSliderInteractor {
  constructor(private readonly sliderGateway: SliderGateway) {}

  async execute(createSliderDto: CreateSliderDTO) {
    return this.sliderGateway.create(createSliderDto);
  }
}
