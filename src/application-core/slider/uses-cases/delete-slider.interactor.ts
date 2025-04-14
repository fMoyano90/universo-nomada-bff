import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SliderGateway } from '../../../infrastructure/database/gateways/slider.gateway';
import { AzureStorageService } from '../../../infrastructure/services/azure-storage.service';

@Injectable()
export class DeleteSliderInteractor {
  private readonly logger = new Logger(DeleteSliderInteractor.name);

  constructor(
    private readonly sliderGateway: SliderGateway,
    private readonly azureStorageService: AzureStorageService,
  ) {}

  async execute(id: number): Promise<boolean> {
    this.logger.log(`Ejecutando DeleteSliderInteractor para ID: ${id}`);

    // 1. Obtener la información del slider antes de eliminarlo
    const sliderToDelete = await this.sliderGateway.findById(id);
    if (!sliderToDelete) {
      this.logger.warn(`Slider con ID ${id} no encontrado para eliminar`);
      throw new NotFoundException(`Slider con ID ${id} no encontrado`);
    }

    // 2. Guardar la URL de la imagen para eliminarla después
    const imageUrl = sliderToDelete.imageUrl;

    // 3. Eliminar el slider de la base de datos
    const deleted = await this.sliderGateway.delete(id);

    // 4. Si se eliminó correctamente, eliminar la imagen del blob storage
    if (deleted && imageUrl) {
      this.logger.log(
        `Slider con ID ${id} eliminado. Procediendo a eliminar imagen.`,
      );

      // Extraer el nombre del blob de la URL
      const blobName = this.azureStorageService.getBlobNameFromUrl(imageUrl);

      if (blobName) {
        try {
          await this.azureStorageService.deleteBlob(blobName);
          this.logger.log(`Imagen ${blobName} eliminada con éxito`);
        } catch (error) {
          // No falla la operación si hay un error al eliminar la imagen
          this.logger.error(
            `Error al eliminar imagen ${blobName}: ${error.message}`,
            error.stack,
          );
        }
      } else {
        this.logger.warn(
          `No se pudo extraer el nombre del blob de la URL: ${imageUrl}`,
        );
      }
    }

    return deleted;
  }
}
