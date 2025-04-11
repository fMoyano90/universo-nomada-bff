import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DestinationGateway } from '../../../infrastructure/database/gateways/destination.gateway';
import { AzureStorageService } from '../../../infrastructure/services/azure-storage.service';

@Injectable()
export class DeleteDestinationInteractor {
  private readonly logger = new Logger(DeleteDestinationInteractor.name);

  constructor(
    private readonly destinationGateway: DestinationGateway,
    private readonly azureStorageService: AzureStorageService,
  ) {}

  async execute(id: number): Promise<boolean> {
    this.logger.log(`Executing DeleteDestinationInteractor for ID: ${id}`);

    // 1. Fetch destination details BEFORE deleting to get image URLs
    const destinationToDelete = await this.destinationGateway.findById(id);
    if (!destinationToDelete) {
      this.logger.warn(`Destination with ID ${id} not found for deletion.`);
      throw new NotFoundException(`Destination with ID ${id} not found`);
    }

    const mainImageUrl = destinationToDelete.imageSrc;
    const galleryImageUrls =
      destinationToDelete.galleryImages?.map((img) => img.imageUrl) || [];

    // 2. Delete destination from database (cascades handle related data)
    const deleted = await this.destinationGateway.delete(id);

    if (deleted) {
      this.logger.log(
        `Successfully deleted destination record for ID: ${id}. Now deleting images.`,
      );

      // 3. Delete images from Azure Blob Storage (fire and forget, or await if critical)
      // We'll log errors but generally won't fail the operation if blob deletion fails,
      // as the primary goal is removing the DB record.

      // Delete main image
      if (mainImageUrl) {
        const blobName =
          this.azureStorageService.getBlobNameFromUrl(mainImageUrl);
        if (blobName) {
          this.azureStorageService
            .deleteBlob(blobName)
            .then(() =>
              this.logger.debug(
                `Successfully deleted main image blob: ${blobName} (URL: ${mainImageUrl})`,
              ),
            )
            .catch((error) =>
              this.logger.error(
                `Failed to delete main image blob ${blobName}: ${error.message}`,
                error.stack,
              ),
            );
        } else {
          this.logger.warn(
            `Could not extract blob name from main image URL: ${mainImageUrl}`,
          );
        }
      }

      // Delete gallery images
      if (galleryImageUrls.length > 0) {
        galleryImageUrls.forEach((url) => {
          const blobName = this.azureStorageService.getBlobNameFromUrl(url);
          if (blobName) {
            this.azureStorageService
              .deleteBlob(blobName)
              .then(() =>
                this.logger.debug(
                  `Successfully deleted gallery image blob: ${blobName} (URL: ${url})`,
                ),
              )
              .catch((error) =>
                this.logger.error(
                  `Failed to delete gallery image blob ${blobName}: ${error.message}`,
                  error.stack,
                ),
              );
          } else {
            this.logger.warn(
              `Could not extract blob name from gallery image URL: ${url}`,
            );
          }
        });
      }
    }

    return deleted; // Return true if DB deletion was successful
  }
}
