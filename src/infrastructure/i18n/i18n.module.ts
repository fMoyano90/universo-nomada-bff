import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  I18nModule as NestI18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
  CookieResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { TranslationService } from './translation.service';

@Module({
  imports: [
    NestI18nModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>('DEFAULT_LOCALE', 'es'),
        loaderOptions: {
          path: join(__dirname, '..', '..', 'i18n'),
          watch: configService.get<string>('NODE_ENV') !== 'production',
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang', 'l'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
        new CookieResolver(['lang', 'l']),
      ],
      inject: [ConfigService],
    }),
  ],
  providers: [TranslationService],
  exports: [NestI18nModule, TranslationService],
})
export class I18nModule {}
