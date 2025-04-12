import { Injectable } from '@nestjs/common';
import { SliderGateway } from '../../../infrastructure/database/gateways/slider.gateway';

@Injectable()
export class DeleteSliderInteractor {
  constructor(private readonly sliderGateway: SliderGateway) {}

  async execute(id: number) {
    return this.sliderGateway.delete(id);
  }
}
