import { Slider } from '../../infrastructure/database/entities/slider.entity';
import {
  CreateSliderDTO,
  UpdateSliderDTO,
} from '../../application-core/slider/dto/slider.dto';

export interface ISliderGateway {
  create(createDto: CreateSliderDTO): Promise<Slider>;
  findAll(): Promise<Slider[]>;
  findById(id: number): Promise<Slider | null>;
  update(id: number, updateDto: UpdateSliderDTO): Promise<Slider>;
  delete(id: number): Promise<boolean>;
  reorder(id: number, direction: 'up' | 'down'): Promise<boolean>;
}
