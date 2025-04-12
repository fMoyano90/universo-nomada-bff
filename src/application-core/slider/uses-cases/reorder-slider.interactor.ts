import { Injectable } from '@nestjs/common';
import { SliderGateway } from '../../../infrastructure/database/gateways/slider.gateway';

@Injectable()
export class ReorderSliderInteractor {
  constructor(private readonly sliderGateway: SliderGateway) {}

  async execute(id: number, direction: 'up' | 'down') {
    return this.sliderGateway.reorder(id, direction);
  }
}
