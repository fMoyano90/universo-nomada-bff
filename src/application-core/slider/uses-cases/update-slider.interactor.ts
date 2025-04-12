import { Injectable } from '@nestjs/common';
import { SliderGateway } from '../../../infrastructure/database/gateways/slider.gateway';
import { UpdateSliderDTO } from '../dto/slider.dto';

@Injectable()
export class UpdateSliderInteractor {
  constructor(private readonly sliderGateway: SliderGateway) {}

  async execute(id: number, updateSliderDto: UpdateSliderDTO) {
    return this.sliderGateway.update(id, updateSliderDto);
  }
}
