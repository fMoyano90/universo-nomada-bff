import { Injectable } from '@nestjs/common';
import { SliderGateway } from '../../../infrastructure/database/gateways/slider.gateway';

@Injectable()
export class GetSlidersInteractor {
  constructor(private readonly sliderGateway: SliderGateway) {}

  async execute() {
    return this.sliderGateway.findAll();
  }
}
