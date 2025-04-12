import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slider } from '../entities/slider.entity';
import { ISliderGateway } from '../../../domain/gateways/slider.gateway';
import {
  CreateSliderDTO,
  UpdateSliderDTO,
} from '../../../application-core/slider/dto/slider.dto';

@Injectable()
export class SliderGateway implements ISliderGateway {
  private readonly logger = new Logger(SliderGateway.name);

  constructor(
    @InjectRepository(Slider)
    private sliderRepository: Repository<Slider>,
  ) {}

  async create(createDto: CreateSliderDTO): Promise<Slider> {
    this.logger.log(`Creating new slider: ${JSON.stringify(createDto)}`);

    const maxOrderSlider = await this.sliderRepository.findOne({
      order: { displayOrder: 'DESC' },
    });

    const newSlider = this.sliderRepository.create({
      ...createDto,
      displayOrder: maxOrderSlider ? maxOrderSlider.displayOrder + 1 : 0,
    });

    return this.sliderRepository.save(newSlider);
  }

  async findAll(): Promise<Slider[]> {
    this.logger.log('Finding all sliders');
    return this.sliderRepository.find({
      order: { displayOrder: 'ASC' },
    });
  }

  async findById(id: number): Promise<Slider | null> {
    this.logger.log(`Finding slider by id: ${id}`);
    return this.sliderRepository.findOneBy({ id });
  }

  async update(id: number, updateDto: UpdateSliderDTO): Promise<Slider> {
    this.logger.log(`Updating slider ${id}: ${JSON.stringify(updateDto)}`);

    const slider = await this.findById(id);
    if (!slider) {
      throw new NotFoundException(`Slider with ID ${id} not found`);
    }

    Object.assign(slider, updateDto);
    return this.sliderRepository.save(slider);
  }

  async delete(id: number): Promise<boolean> {
    this.logger.log(`Deleting slider ${id}`);

    const result = await this.sliderRepository.delete(id);
    return result.affected > 0;
  }

  async reorder(id: number, direction: 'up' | 'down'): Promise<boolean> {
    this.logger.log(`Reordering slider ${id} ${direction}`);

    const slider = await this.findById(id);
    if (!slider) {
      throw new NotFoundException(`Slider with ID ${id} not found`);
    }

    const sliders = await this.findAll();
    const currentIndex = sliders.findIndex((s) => s.id === id);

    if (direction === 'up' && currentIndex > 0) {
      const prevSlider = sliders[currentIndex - 1];
      const tempOrder = slider.displayOrder;
      slider.displayOrder = prevSlider.displayOrder;
      prevSlider.displayOrder = tempOrder;

      await this.sliderRepository.save([slider, prevSlider]);
      return true;
    } else if (direction === 'down' && currentIndex < sliders.length - 1) {
      const nextSlider = sliders[currentIndex + 1];
      const tempOrder = slider.displayOrder;
      slider.displayOrder = nextSlider.displayOrder;
      nextSlider.displayOrder = tempOrder;

      await this.sliderRepository.save([slider, nextSlider]);
      return true;
    }

    return false;
  }
}
