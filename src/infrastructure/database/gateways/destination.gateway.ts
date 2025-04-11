import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Destination } from '../entities/destination.entity';
import { ItineraryItem } from '../entities/itinerary-item.entity';
import { ItineraryDetail } from '../entities/itinerary-detail.entity';
import { Include } from '../entities/include.entity';
import { Exclude } from '../entities/exclude.entity';
import { Tip } from '../entities/tip.entity';
import { Faq } from '../entities/faq.entity';
import { GalleryImage } from '../entities/gallery-image.entity';
import { CreateDestinationRequestDTO } from 'src/application-core/destination/dto/destination.dto'; // Adjust path if needed

@Injectable()
export class DestinationGateway {
  private readonly logger = new Logger(DestinationGateway.name);

  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>, // Inject repositories for related entities if needed for complex operations, // but TypeORM cascades should handle simple creates/updates via the Destination repo.
  ) {}

  async create(createDto: CreateDestinationRequestDTO): Promise<Destination> {
    this.logger.debug(`Creating destination: ${createDto.title}`);
    try {
      // Map DTO to the Destination entity structure
      // TypeORM handles nested entities automatically if cascade is true
      const destination = this.destinationRepository.create({
        ...createDto,
        // Explicitly map nested DTOs if structure differs significantly or needs transformation
        // For simple cases like this where DTO structure matches entity structure,
        // spreading the DTO is often sufficient with cascade enabled.
        // Example of explicit mapping (if needed):
        // itineraryItems: createDto.itineraryItems?.map(itemDto => ({
        //   ...itemDto,
        //   details: itemDto.details?.map(detailDto => ({ ...detailDto }))
        // })),
        // includes: createDto.includes?.map(dto => ({ ...dto })),
        // excludes: createDto.excludes?.map(dto => ({ ...dto })),
        // tips: createDto.tips?.map(dto => ({ ...dto })),
        // faqs: createDto.faqs?.map(dto => ({ ...dto })),
        // galleryImages: createDto.galleryImages?.map(dto => ({ ...dto })),
      });

      return await this.destinationRepository.save(destination);
    } catch (error) {
      this.logger.error(
        `Error creating destination: ${error.message}`,
        error.stack,
      );
      // Consider throwing a more specific DB error or custom exception
      throw error;
    }
  }

  async findAll(): Promise<Destination[]> {
    this.logger.debug('Finding all destinations');
    return this.destinationRepository.find({
      // Optionally add relations if needed for list view
      // relations: ['itineraryItems', 'includes', 'excludes', 'tips', 'faqs', 'galleryImages'],
    });
  }

  async findById(id: number): Promise<Destination | null> {
    this.logger.debug(`Finding destination by ID: ${id}`);
    const destination = await this.destinationRepository.findOne({
      where: { id },
      relations: [
        // Load all relations for detail view
        'itineraryItems',
        'itineraryItems.details',
        'includes',
        'excludes',
        'tips',
        'faqs',
        'galleryImages',
      ],
    });
    if (!destination) {
      this.logger.warn(`Destination with ID ${id} not found`);
    }
    return destination;
  }

  // Add update and delete methods later as needed
  // async update(id: number, updateData: Partial<Destination>): Promise<Destination | null> { ... }
  // async delete(id: number): Promise<boolean> { ... }
}
