import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway';
import { AzureStorageService } from '../../../infrastructure/services/azure-storage.service'; // Import Azure service
import {
  CreateDestinationRequestDTO,
  DestinationResponseDTO,
} from '../dto/destination.dto'; // Adjust path if needed
import { Destination } from '../../../infrastructure/database/entities/destination.entity';

@Injectable()
export class CreateDestinationInteractor {
  private readonly logger = new Logger(CreateDestinationInteractor.name);

  constructor(
    private readonly destinationGateway: DestinationGateway,
    private readonly azureStorageService: AzureStorageService, // Inject Azure service
  ) {}

  async execute(
    createDto: CreateDestinationRequestDTO,
    imageSrcFile?: Express.Multer.File, // Add main image file
    galleryImageFiles?: Express.Multer.File[], // Add gallery image files
  ): Promise<Destination> {
    // Returning the full entity for now
    this.logger.log(
      `Executing CreateDestinationInteractor for: ${createDto.title}`,
    );
    try {
      // 1. Upload main image (if provided)
      let imageSrcUrl = createDto.imageSrc; // Use provided URL if no file
      if (imageSrcFile) {
        this.logger.debug(`Uploading main image: ${imageSrcFile.originalname}`);
        try {
          imageSrcUrl = await this.azureStorageService.uploadBlob(
            `destinations/main/${Date.now()}-${imageSrcFile.originalname}`,
            imageSrcFile.buffer,
            imageSrcFile.mimetype,
          );
          this.logger.debug(`Main image uploaded to: ${imageSrcUrl}`);
        } catch (uploadError) {
          this.logger.error(
            `Failed to upload main image: ${uploadError.message}`,
            uploadError.stack,
          );
          throw new BadRequestException(
            `Failed to upload main image: ${uploadError.message}`,
          );
        }
      } else if (!imageSrcUrl) {
        // If neither file nor URL is provided for main image, throw error (or handle as needed)
        throw new BadRequestException(
          'Main destination image (imageSrc) is required.',
        );
      }

      // 2. Upload gallery images (if provided)
      const galleryUrls: { imageUrl: string }[] = [];
      if (galleryImageFiles && galleryImageFiles.length > 0) {
        this.logger.debug(
          `Uploading ${galleryImageFiles.length} gallery images.`,
        );
        for (const file of galleryImageFiles) {
          try {
            const galleryUrl = await this.azureStorageService.uploadBlob(
              `destinations/gallery/${Date.now()}-${file.originalname}`,
              file.buffer,
              file.mimetype,
            );
            galleryUrls.push({ imageUrl: galleryUrl });
            this.logger.debug(`Gallery image uploaded to: ${galleryUrl}`);
          } catch (uploadError) {
            this.logger.error(
              `Failed to upload gallery image ${file.originalname}: ${uploadError.message}`,
              uploadError.stack,
            );
            // Decide whether to continue or fail the whole request
            // For now, let's throw an error
            throw new BadRequestException(
              `Failed to upload gallery image ${file.originalname}: ${uploadError.message}`,
            );
          }
        }
      }

      // 3. Prepare data for gateway (update DTO with URLs)
      // We cast here because we've manually constructed the object with the necessary fields
      // and replaced/added the image URLs. Validation should happen at the controller level.
      const destinationDataToSave = {
        ...createDto,
        imageSrc: imageSrcUrl, // Use the uploaded/provided URL
        galleryImages: galleryUrls, // Use the uploaded URLs
      } as CreateDestinationRequestDTO; // Cast to expected type

      // 4. Create destination entry in DB via gateway
      // The gateway will handle saving the destination and its relations (including gallery image URLs)
      const createdDestination = await this.destinationGateway.create(
        destinationDataToSave,
      );

      this.logger.log(
        `Successfully created destination with ID: ${createdDestination.id}`,
      );

      // You could map this to DestinationResponseDTO if needed,
      // but returning the entity might be sufficient depending on controller needs.
      return createdDestination;
    } catch (error) {
      this.logger.error(
        `Failed to create destination: ${error.message}`,
        error.stack,
      );
      // Re-throw the error to be handled by global exception filters or controller
      throw error;
    }
  }
}
