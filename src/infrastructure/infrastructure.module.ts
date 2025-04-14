import { Module } from '@nestjs/common';
import { AzureStorageService } from './services/azure-storage.service';
import { ImageUtilsService } from './services/image-utils.service';
import { I18nModule } from './i18n/i18n.module';

@Module({
  imports: [I18nModule],
  providers: [AzureStorageService, ImageUtilsService],
  exports: [AzureStorageService, ImageUtilsService, I18nModule],
})
export class InfrastructureModule {}
