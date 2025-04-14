import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SliderGateway } from '../../../infrastructure/database/gateways/slider.gateway';
import { CreateSliderDTO } from '../dto/slider.dto';
import { AzureStorageService } from '../../../infrastructure/services/azure-storage.service';
import { ImageUtilsService } from '../../../infrastructure/services/image-utils.service';

@Injectable()
export class CreateSliderInteractor {
  private readonly logger = new Logger(CreateSliderInteractor.name);

  constructor(
    private readonly sliderGateway: SliderGateway,
    private readonly azureStorageService: AzureStorageService,
    private readonly imageUtilsService: ImageUtilsService,
  ) {}

  async execute(
    createSliderDto: CreateSliderDTO,
    imageFile?: Express.Multer.File,
  ) {
    this.logger.log(
      `Ejecutando CreateSliderInteractor para: ${createSliderDto.title}`,
    );

    try {
      // Verificar si tenemos un archivo o una URL
      let imageUrl = createSliderDto.imageUrl;

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
        imageUrl = await this.azureStorageService.uploadBlob(
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
        createSliderDto.imageUrl = imageUrl;
      } else if (!imageUrl) {
        // Si no hay imagen ni URL, lanzar error
        throw new BadRequestException('Se requiere una imagen para el slider');
      }

      // 3. Crear el slider en la base de datos
      const createdSlider = await this.sliderGateway.create(createSliderDto);
      this.logger.log(`Slider creado con éxito con ID: ${createdSlider.id}`);

      return createdSlider;
    } catch (error) {
      this.logger.error(`Error al crear slider: ${error.message}`, error.stack);
      throw error;
    }
  }
}
