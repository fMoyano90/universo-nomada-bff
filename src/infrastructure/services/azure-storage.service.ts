import { Injectable, Logger } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class AzureStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerClient: any = null;
  private readonly logger = new Logger(AzureStorageService.name);
  private isEnabled = false;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_CONTAINER_NAME;

    if (!connectionString || connectionString.trim() === '') {
      this.logger.warn(
        'Azure Storage desactivado: AZURE_STORAGE_CONNECTION_STRING no configurado',
      );
      this.isEnabled = false;
      return;
    }

    try {
      this.blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);

      if (containerName && containerName.trim() !== '') {
        this.containerClient =
          this.blobServiceClient.getContainerClient(containerName);
        this.isEnabled = true;
        this.logger.log('Azure Storage inicializado correctamente');
      } else {
        this.logger.warn(
          'Azure Storage parcialmente desactivado: AZURE_CONTAINER_NAME no configurado',
        );
        this.isEnabled = false;
      }
    } catch (error) {
      this.logger.error(`Error al inicializar Azure Storage: ${error.message}`);
      this.isEnabled = false;
    }
  }

  async uploadBlob(
    blobName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    if (!this.isEnabled || !this.containerClient) {
      this.logger.warn(
        'Intento de carga de archivo con Azure Storage desactivado',
      );
      return null;
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: contentType },
      });
      return blockBlobClient.url;
    } catch (error) {
      this.logger.error(
        `Error al subir archivo a Azure Storage: ${error.message}`,
      );
      return null;
    }
  }

  async deleteBlob(blobName: string): Promise<void> {
    if (!this.isEnabled || !this.containerClient) {
      this.logger.warn(
        `Intento de eliminación de blob (${blobName}) con Azure Storage desactivado`,
      );
      return; // Or throw an error if deletion failure should be critical
    }

    try {
      this.logger.debug(`Eliminando blob: ${blobName}`);
      await this.containerClient.deleteBlob(blobName);
      this.logger.log(`Blob eliminado correctamente: ${blobName}`);
    } catch (error) {
      // Handle specific errors like BlobNotFound
      if (error.statusCode === 404) {
        this.logger.warn(`Blob no encontrado para eliminar: ${blobName}`);
      } else {
        this.logger.error(
          `Error al eliminar blob ${blobName}: ${error.message}`,
          error.stack,
        );
        // Decide if you want to re-throw the error
        // throw error;
      }
    }
  }

  // Helper to extract blob name from URL
  getBlobNameFromUrl(url: string): string | null {
    if (!url) return null;
    try {
      const urlParts = new URL(url);
      // Assumes the blob name is the path after the container name
      // e.g., https://<account>.blob.core.windows.net/<container>/<blobName>
      const pathSegments = urlParts.pathname
        .split('/')
        .filter((segment) => segment);
      if (pathSegments.length > 1) {
        // Join segments after the container name
        return pathSegments.slice(1).join('/');
      }
    } catch (error) {
      this.logger.error(
        `Error al parsear URL para obtener nombre de blob: ${url}`,
        error.stack,
      );
    }
    return null;
  }
}
