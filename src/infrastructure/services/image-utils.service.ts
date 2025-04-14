import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageUtilsService {
  private readonly logger = new Logger(ImageUtilsService.name);

  /**
   * Optimiza una imagen para reducir su tamaño manteniendo una buena calidad
   * @param buffer Buffer de la imagen original
   * @param options Opciones de optimización
   * @returns Buffer de la imagen optimizada
   */
  async optimizeImage(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'webp' | 'png' | 'avif';
    } = {},
  ): Promise<Buffer> {
    const {
      width,
      height,
      quality = 80, // Calidad por defecto: 80%
      format = 'webp', // Formato por defecto: webp (mejor compresión)
    } = options;

    try {
      let sharpInstance = sharp(buffer);

      // Obtener metadatos de la imagen original
      const metadata = await sharpInstance.metadata();
      const originalWidth = metadata.width;
      const originalHeight = metadata.height;

      // Redimensionar la imagen si es necesario
      if (width || height) {
        sharpInstance = sharpInstance.resize({
          width,
          height,
          fit: 'inside', // Mantener proporciones
          withoutEnlargement: true, // No agrandar si es más pequeña
        });
      } else if (originalWidth > 1920) {
        // Si la imagen es muy grande, reducirla a un máximo de 1920px de ancho
        sharpInstance = sharpInstance.resize({
          width: 1920,
          height: undefined,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Aplicar formato y calidad
      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({
            quality: Math.min(Math.round(quality / 10), 9), // PNG quality es de 0-9
            compressionLevel: 8, // Nivel de compresión alto
          });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality });
          break;
      }

      // Generar el buffer optimizado
      const optimizedBuffer = await sharpInstance.toBuffer();

      // Calcular y registrar la reducción de tamaño
      const originalSize = buffer.length;
      const optimizedSize = optimizedBuffer.length;
      const reduction = ((originalSize - optimizedSize) / originalSize) * 100;

      this.logger.log(
        `Imagen optimizada: ${optimizedSize} bytes (${reduction.toFixed(
          2,
        )}% de reducción)`,
      );

      return optimizedBuffer;
    } catch (error) {
      this.logger.error(
        `Error al optimizar imagen: ${error.message}`,
        error.stack,
      );
      // Si hay error, devolver el buffer original
      return buffer;
    }
  }
}
