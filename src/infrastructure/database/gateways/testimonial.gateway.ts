import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { Testimonial } from '../entities/testimonial.entity';
import { TestimonialGateway } from '../../../domain/gateways/testimonial.gateway';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from '../../../application-core/testimonial/dto/testimonial.dto';
import {
  PaginationOptions,
  PaginationResult,
} from '../../../common/interfaces/pagination.interface';

@Injectable()
export class TestimonialDbGateway implements TestimonialGateway {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  async create(
    createTestimonialDto: CreateTestimonialDto,
  ): Promise<Testimonial> {
    const newTestimonial =
      this.testimonialRepository.create(createTestimonialDto);
    return this.testimonialRepository.save(newTestimonial);
  }

  async findAll(
    options: PaginationOptions,
  ): Promise<PaginationResult<Testimonial>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;
    const skip = (page - 1) * limit;

    const findOptions: FindManyOptions<Testimonial> = {
      take: limit,
      skip: skip,
      order: { [sortBy]: sortOrder },
    };

    const [data, total] = await this.testimonialRepository.findAndCount(
      findOptions,
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Testimonial | null> {
    const options: FindOneOptions<Testimonial> = { where: { id } };
    const testimonial = await this.testimonialRepository.findOne(options);
    if (!testimonial) {
      // Consider throwing NotFoundException here or let the interactor handle it
      // throw new NotFoundException(`Testimonial with ID ${id} not found`);
      return null;
    }
    return testimonial;
  }

  async update(
    id: number,
    updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<Testimonial | null> {
    const testimonial = await this.findById(id);
    if (!testimonial) {
      // Consider throwing NotFoundException here or let the interactor handle it
      // throw new NotFoundException(`Testimonial with ID ${id} not found`);
      return null;
    }
    // Merge the existing entity with the new data
    this.testimonialRepository.merge(testimonial, updateTestimonialDto);
    return this.testimonialRepository.save(testimonial);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.testimonialRepository.delete(id);
    // Check if any rows were affected
    return (
      result.affected !== undefined &&
      result.affected !== null &&
      result.affected > 0
    );
  }

  async findLatest(limit: number): Promise<Testimonial[]> {
    return this.testimonialRepository.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
