import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway';
import { AzureStorageService } from '../../../infrastructure/services/azure-storage.service';
import { UpdateDestinationRequestDTO } from '../dto/destination.dto';
import { Destination } from '../../../infrastructure/database/entities/destination.entity';
import { GalleryImage } from '../../../infrastructure/database/entities/gallery-image.entity'; // Needed for type casting

@Injectable()
export class UpdateDestinationInteractor {
  private readonly logger = new Logger(UpdateDestinationInteractor.name);

  constructor(
    private readonly destinationGateway: DestinationGateway,
    private readonly azureStorageService: AzureStorageService,
  ) {}

  async execute(
    id: number,
    updateDto: UpdateDestinationRequestDTO,
    imageSrcFile?: Express.Multer.File,
    galleryImageFiles?: Express.Multer.File[],
    // Add a flag or specific field in DTO if needed to indicate deletion of existing gallery images
    // For now, we assume new gallery images replace old ones if provided.
  ): Promise<Destination> {
    this.logger.log(`Executing UpdateDestinationInteractor for ID: ${id}`);

    // 1. Check if destination exists (optional, gateway also checks)
    // const existing = await this.destinationGateway.findById(id);
    // if (!existing) {
    //   throw new NotFoundException(`Destination with ID ${id} not found`);
    // }

    // 2. Handle main image update (if file provided)
    let imageSrcUrl = updateDto.imageSrc; // Keep existing URL if no new file
    if (imageSrcFile) {
      this.logger.debug(
        `Uploading new main image: ${imageSrcFile.originalname}`,
      );
      try {
        imageSrcUrl = await this.azureStorageService.uploadBlob(
          `destinations/main/${Date.now()}-${imageSrcFile.originalname}`,
          imageSrcFile.buffer,
          imageSrcFile.mimetype,
        );
        this.logger.debug(`New main image uploaded to: ${imageSrcUrl}`);
        updateDto.imageSrc = imageSrcUrl; // Update DTO with the new URL
      } catch (uploadError) {
        this.logger.error(
          `Failed to upload main image during update: ${uploadError.message}`,
          uploadError.stack,
        );
        throw new BadRequestException(
          `Failed to upload main image: ${uploadError.message}`,
        );
      }
    }

    // 3. Handle gallery image updates (if files provided)
    // This simple implementation REPLACES existing gallery images if new ones are uploaded.
    // More complex logic would be needed to add/remove specific images.
    if (galleryImageFiles && galleryImageFiles.length > 0) {
      this.logger.debug(
        `Uploading ${galleryImageFiles.length} new gallery images (will replace existing).`,
      );
      const galleryUrls: { imageUrl: string }[] = [];
      for (const file of galleryImageFiles) {
        try {
          const galleryUrl = await this.azureStorageService.uploadBlob(
            `destinations/gallery/${Date.now()}-${file.originalname}`,
            file.buffer,
            file.mimetype,
          );
          galleryUrls.push({ imageUrl: galleryUrl });
          this.logger.debug(`New gallery image uploaded to: ${galleryUrl}`);
        } catch (uploadError) {
          this.logger.error(
            `Failed to upload gallery image ${file.originalname} during update: ${uploadError.message}`,
            uploadError.stack,
          );
          throw new BadRequestException(
            `Failed to upload gallery image ${file.originalname}: ${uploadError.message}`,
          );
        }
      }
      // Update the DTO to include the new gallery image URLs for the gateway to process
      updateDto.galleryImages = galleryUrls as GalleryImage[]; // Cast needed as DTO expects GalleryImageDTO structure but gateway maps it
    } else if (updateDto.galleryImages !== undefined) {
      // If galleryImages array is explicitly provided in DTO (even if empty),
      // assume intent is to replace/clear existing gallery.
      // The gateway's merge/save logic with cascade handles this.
      this.logger.debug(
        'Gallery images provided in DTO, will be updated/replaced.',
      );
    }
    // If galleryImageFiles is empty AND updateDto.galleryImages is undefined, existing gallery images remain untouched.

    // 4. Pass the potentially modified DTO to the gateway
    try {
      const updatedDestination = await this.destinationGateway.update(
        id,
        updateDto,
      );
      this.logger.log(`Successfully updated destination with ID: ${id}`);
      return updatedDestination;
    } catch (error) {
      // Catch potential NotFoundException from gateway or other DB errors
      this.logger.error(
        `Failed to update destination with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw
    }
  }
}
