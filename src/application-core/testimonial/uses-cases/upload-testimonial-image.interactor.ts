import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AzureStorageService } from '../../../infrastructure/services/azure-storage.service';
import { ImageUtilsService } from '../../../infrastructure/services/image-utils.service';

@Injectable()
export class UploadTestimonialImageInteractor {
  private readonly logger = new Logger(UploadTestimonialImageInteractor.name);

  constructor(
    private readonly azureStorageService: AzureStorageService,
    private readonly imageUtilsService: ImageUtilsService,
  ) {}

  async execute(file: Express.Multer.File): Promise<{
    url: string;
    filename: string;
    mimetype: string;
    size: number;
  }> {
    this.logger.log(
      `Executing UploadTestimonialImageInteractor for file: ${file.originalname}`,
    );

    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    // Validar tipo de archivo
    const validImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!validImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'El archivo debe ser una imagen (JPEG, PNG, GIF, WEBP)',
      );
    }

    // Validar tamaño del archivo (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('La imagen no debe superar los 5MB');
    }

    try {
      // Optimizar la imagen antes de subirla (opcional)
      const format = file.mimetype.split('/')[1] as
        | 'jpeg'
        | 'png'
        | 'webp'
        | 'avif';
      const optimizedBuffer = await this.imageUtilsService.optimizeImage(
        file.buffer,
        {
          quality: 80,
          format: format || 'jpeg',
        },
      );

      // Subir la imagen a Azure Storage
      const fileName = `testimonials/${Date.now()}-${file.originalname}`;
      const url = await this.azureStorageService.uploadBlob(
        fileName,
        optimizedBuffer || file.buffer,
        file.mimetype,
      );

      this.logger.log(`Image uploaded successfully: ${url}`);

      return {
        url,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(
        `Error uploading testimonial image: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error al subir la imagen: ${error.message}`,
      );
    }
  }
}
