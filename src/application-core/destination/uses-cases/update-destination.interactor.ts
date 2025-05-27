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
  ): Promise<Destination> {
    this.logger.log(`Executing UpdateDestinationInteractor for ID: ${id}`);

    // Log para depuración, no modificar valores
    if (updateDto.isRecommended !== undefined) {
      this.logger.debug(
        `[INTERACTOR UPDATE] isRecommended recibido: ${
          updateDto.isRecommended
        } (${typeof updateDto.isRecommended})`,
      );
    }

    if (updateDto.isSpecial !== undefined) {
      this.logger.debug(
        `[INTERACTOR UPDATE] isSpecial recibido: ${
          updateDto.isSpecial
        } (${typeof updateDto.isSpecial})`,
      );
    }

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

    // 3. Handle gallery image updates - LÓGICA COMPLETA PARA TODOS LOS CASOS
    const finalGalleryImages: { imageUrl: string }[] = [];

    // Caso especial: Si clearGallery es true, limpiar toda la galería
    if (updateDto.clearGallery === 'true') {
      this.logger.debug('Clearing all gallery images as requested.');
      updateDto.galleryImages = []; // Array vacío para limpiar
    } else {
      // Primero, agregar las imágenes existentes que el usuario quiere preservar
      if (
        updateDto.existingGalleryImages &&
        updateDto.existingGalleryImages.length > 0
      ) {
        finalGalleryImages.push(...updateDto.existingGalleryImages);
        this.logger.debug(
          `Preserving ${updateDto.existingGalleryImages.length} existing gallery images.`,
        );
      }

      // Luego, subir y agregar las nuevas imágenes
      if (galleryImageFiles && galleryImageFiles.length > 0) {
        this.logger.debug(
          `Uploading ${galleryImageFiles.length} new gallery images.`,
        );

        for (const file of galleryImageFiles) {
          try {
            const galleryUrl = await this.azureStorageService.uploadBlob(
              `destinations/gallery/${Date.now()}-${file.originalname}`,
              file.buffer,
              file.mimetype,
            );
            finalGalleryImages.push({ imageUrl: galleryUrl });
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
      }

      // Actualizar el DTO con la combinación final de imágenes
      if (
        finalGalleryImages.length > 0 ||
        updateDto.existingGalleryImages !== undefined
      ) {
        // Si hay imágenes finales O si se enviaron imágenes existentes explícitamente
        // (incluso si el array está vacío, significa que el usuario quiere esa configuración)
        updateDto.galleryImages = finalGalleryImages as GalleryImage[];
        this.logger.debug(
          `Final gallery will have ${finalGalleryImages.length} images total.`,
        );
      } else if (updateDto.galleryImages !== undefined) {
        // Si galleryImages está explícitamente definido en el DTO pero no hay cambios,
        // mantener el comportamiento original
        this.logger.debug(
          'Gallery images provided in DTO, will be updated/replaced.',
        );
      }
      // Si no hay archivos nuevos, ni imágenes existentes explícitas, ni galleryImages en DTO,
      // las imágenes existentes en la BD permanecen intactas.
    }

    // Limpiar los campos auxiliares del DTO antes de enviarlo al gateway
    delete updateDto.existingGalleryImages;
    delete updateDto.clearGallery;

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
