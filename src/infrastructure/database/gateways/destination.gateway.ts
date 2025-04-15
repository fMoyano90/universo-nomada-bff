import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm'; // Import Equal
import { Destination } from '../entities/destination.entity';
import { ItineraryItem } from '../entities/itinerary-item.entity';
import { ItineraryDetail } from '../entities/itinerary-detail.entity';
import { Include } from '../entities/include.entity';
import { Exclude } from '../entities/exclude.entity';
import { Tip } from '../entities/tip.entity';
import { Faq } from '../entities/faq.entity';
import { GalleryImage } from '../entities/gallery-image.entity';
import { DestinationType } from '../enums/destination-type.enum'; // Import the enum
// Import both Create and Update DTOs
import {
  CreateDestinationRequestDTO,
  UpdateDestinationRequestDTO,
} from 'src/application-core/destination/dto/destination.dto'; // Adjust path if needed
import { PaginationResult } from 'src/common/interfaces/pagination.interface'; // Corrected Import

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

  async update(
    id: number,
    updateDto: UpdateDestinationRequestDTO,
  ): Promise<Destination> {
    this.logger.debug(`Updating destination with ID: ${id}`);
    // Fetch the existing entity including all relations that might be updated via cascade
    // This is crucial because TypeORM needs the full entity graph to correctly manage cascades.
    const existingDestination = await this.destinationRepository.findOne({
      where: { id },
      relations: [
        // Include relations that can be updated/replaced
        'itineraryItems',
        'itineraryItems.details',
        'includes',
        'excludes',
        'tips',
        'faqs',
        'galleryImages',
      ],
    });

    if (!existingDestination) {
      this.logger.warn(`Destination with ID ${id} not found for update.`);
      throw new NotFoundException(`Destination with ID ${id} not found`);
    }

    // Merge the update DTO into the loaded entity.
    // TypeORM's merge is smart but doesn't automatically handle deep relations well
    // without explicit mapping or careful DTO structure matching entity structure.
    // For replacing collections (like itineraryItems), assigning the new array from DTO works with cascade.
    const updatedData = this.destinationRepository.merge(
      existingDestination,
      updateDto,
    );

    // Explicitly handle nested arrays if DTO structure differs or needs transformation
    // If the DTO provides a complete replacement array for a relation, assign it directly.
    // TypeORM's cascade on save will handle deleting old items and inserting new ones.
    if (updateDto.itineraryItems !== undefined) {
      updatedData.itineraryItems = updateDto.itineraryItems.map((itemDto) => ({
        ...itemDto, // Spread basic properties
        // Ensure nested details are also mapped if necessary
        details: itemDto.details?.map((detailDto) => ({ ...detailDto })) || [],
      })) as ItineraryItem[]; // Cast might be needed depending on DTO/Entity structure match
    }
    if (updateDto.includes !== undefined) {
      updatedData.includes = updateDto.includes.map((dto) => ({
        ...dto,
      })) as Include[];
    }
    if (updateDto.excludes !== undefined) {
      updatedData.excludes = updateDto.excludes.map((dto) => ({
        ...dto,
      })) as Exclude[];
    }
    if (updateDto.tips !== undefined) {
      updatedData.tips = updateDto.tips.map((dto) => ({ ...dto })) as Tip[];
    }
    if (updateDto.faqs !== undefined) {
      updatedData.faqs = updateDto.faqs.map((dto) => ({ ...dto })) as Faq[];
    }
    if (updateDto.galleryImages !== undefined) {
      updatedData.galleryImages = updateDto.galleryImages.map((dto) => ({
        ...dto,
      })) as GalleryImage[];
    }

    try {
      // Save the merged entity. TypeORM handles updates and cascades.
      const savedDestination = await this.destinationRepository.save(
        updatedData,
      );
      this.logger.log(`Successfully updated destination with ID: ${id}`);
      return savedDestination;
    } catch (error) {
      this.logger.error(
        `Error updating destination with ID ${id}: ${error.message}`,
        error.stack,
      );
      // Consider throwing a more specific DB error or custom exception
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    this.logger.debug(`Deleting destination with ID: ${id}`);
    try {
      const result = await this.destinationRepository.delete(id);
      if (result.affected === 0) {
        this.logger.warn(`Destination with ID ${id} not found for deletion.`);
        throw new NotFoundException(`Destination with ID ${id} not found`);
      }
      this.logger.log(`Successfully deleted destination with ID: ${id}`);
      return true;
    } catch (error) {
      // Catch NotFoundException specifically if needed, otherwise log and rethrow
      this.logger.error(
        `Error deleting destination with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findLatest(limit: number): Promise<Destination[]> {
    this.logger.debug(`Finding latest ${limit} destinations`);
    return this.destinationRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['galleryImages'], // Cargamos las imágenes para mostrar en las cards
    });
  }

  async findLatestSpecial(): Promise<Destination | null> {
    this.logger.debug('Finding latest special destination');
    // Find the most recently created destination marked as special
    // Also load all relations needed for display
    return this.destinationRepository.findOne({
      where: { isSpecial: true },
      order: { createdAt: 'DESC' }, // Order by creation date descending
      relations: [
        'itineraryItems',
        'itineraryItems.details',
        'includes',
        'excludes',
        'tips',
        'faqs',
        'galleryImages',
      ],
    });
  }

  async findRecommendedByType(
    type: DestinationType,
    limit: number,
  ): Promise<Destination[]> {
    this.logger.debug(
      `Finding top ${limit} recommended destinations of type: ${type}`,
    );
    return this.destinationRepository.find({
      where: { type: Equal(type), isRecommended: true }, // Use Equal operator for type
      order: { createdAt: 'DESC' }, // Example ordering: newest first. Adjust if needed.
      take: limit, // Limit the number of results
      // Optionally add relations if needed for display in recommendations
      // relations: ['galleryImages'], // e.g., load main image
    });
  }

  async findPaginatedByType(
    type: DestinationType,
    page: number,
    limit: number,
  ): Promise<PaginationResult<Destination>> {
    // Corrected return type and added newline for eslint
    this.logger.debug(
      `Finding paginated destinations of type: ${type}, page: ${page}, limit: ${limit}`,
    );
    const skip = (page - 1) * limit;

    const [data, total] = await this.destinationRepository.findAndCount({
      where: { type: Equal(type) },
      order: { createdAt: 'DESC' }, // Or any other relevant order
      take: limit,
      skip: skip,
      // Add relations if needed for the paginated list view
      // relations: ['galleryImages'],
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data,
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages, // Use the calculated variable
    };
  }

  // Método nuevo para obtener todos los destinos paginados sin filtrar por tipo
  async findAllPaginated(options: {
    page: number;
    limit: number;
  }): Promise<PaginationResult<Destination>> {
    const { page, limit } = options;
    this.logger.debug(
      `Finding all paginated destinations, page: ${page}, limit: ${limit}`,
    );

    const skip = (page - 1) * limit;

    try {
      const [data, total] = await this.destinationRepository.findAndCount({
        order: { createdAt: 'DESC' },
        take: limit,
        skip: skip,
        // Add relations if needed for the paginated list view
        // relations: ['galleryImages'],
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(
        `Error finding all paginated destinations: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<Destination | null> {
    this.logger.debug(`Buscando destino por slug: ${slug}`);
    try {
      const destination = await this.destinationRepository.findOne({
        where: { slug: Equal(slug) },
        relations: [
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
        this.logger.warn(`No se encontró destino con slug: ${slug}`);
        return null;
      }

      return destination;
    } catch (error) {
      this.logger.error(
        `Error buscando destino por slug ${slug}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
