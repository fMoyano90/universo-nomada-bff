import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SliderGateway } from '../../../infrastructure/database/gateways/slider.gateway';
import { UpdateSliderDTO } from '../dto/slider.dto';
import { AzureStorageService } from '../../../infrastructure/services/azure-storage.service';
import { ImageUtilsService } from '../../../infrastructure/services/image-utils.service';

@Injectable()
export class UpdateSliderInteractor {
  private readonly logger = new Logger(UpdateSliderInteractor.name);

  constructor(
    private readonly sliderGateway: SliderGateway,
    private readonly azureStorageService: AzureStorageService,
    private readonly imageUtilsService: ImageUtilsService,
  ) {}

  async execute(
    id: number,
    updateSliderDto: UpdateSliderDTO,
    imageFile?: Express.Multer.File,
  ) {
    this.logger.log(`Ejecutando UpdateSliderInteractor para ID: ${id}`);

    try {
      // Si hay un archivo de imagen, lo procesamos
      if (imageFile) {
        this.logger.debug(`Procesando imagen: ${imageFile.originalname}`);

        // 1. Optimizar la imagen
        const optimizedBuffer = await this.imageUtilsService.optimizeImage(
          imageFile.buffer,
          {
            width: 1920, // Ancho máximo para un slider
            quality: 85, // Calidad óptima para imágenes de banner
            format: 'webp', // WebP para mejor compresión con buena calidad
          },
        );

        // 2. Subir la imagen a Azure Blob Storage
        const blobName = `sliders/${Date.now()}-${imageFile.originalname.replace(
          /\s+/g,
          '-',
        )}`;
        const imageUrl = await this.azureStorageService.uploadBlob(
          blobName,
          optimizedBuffer,
          'image/webp', // El formato webp ya que optimizamos a este formato
        );

        if (!imageUrl) {
          throw new BadRequestException(
            'Error al subir la imagen a Azure Storage',
          );
        }

        this.logger.debug(`Imagen subida exitosamente a: ${imageUrl}`);

        // Actualizar el DTO con la URL de la imagen
        updateSliderDto.imageUrl = imageUrl;
      }

      // Actualizar el slider en la base de datos
      const updatedSlider = await this.sliderGateway.update(
        id,
        updateSliderDto,
      );
      this.logger.log(`Slider actualizado con éxito con ID: ${id}`);

      return updatedSlider;
    } catch (error) {
      this.logger.error(
        `Error al actualizar slider con ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
