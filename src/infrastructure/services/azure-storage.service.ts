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
}
