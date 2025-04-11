import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

/**
 * Servicio para manejar traducciones
 */
@Injectable()
export class TranslationService {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Traduce una clave al idioma especificado
   * @param key Clave de traducción
   * @param args Argumentos para interpolar en la traducción
   * @param lang Idioma (opcional, por defecto usa el especificado en la solicitud)
   */
  translate(key: string, args?: Record<string, any>, lang?: string): string {
    return this.i18n.translate(key, { args, lang });
  }

  /**
   * Traduce mensajes de error
   * @param errorKey Clave del error
   * @param args Argumentos para interpolar en la traducción
   * @param lang Idioma
   */
  translateError(
    errorKey: string,
    args?: Record<string, any>,
    lang?: string,
  ): string {
    return this.translate(`common.errors.${errorKey}`, args, lang);
  }

  /**
   * Traduce mensajes de validación
   * @param validationKey Clave de validación
   * @param args Argumentos para interpolar en la traducción
   * @param lang Idioma
   */
  translateValidation(
    validationKey: string,
    args?: Record<string, any>,
    lang?: string,
  ): string {
    return this.translate(
      `common.errors.validation.${validationKey}`,
      args,
      lang,
    );
  }

  /**
   * Obtiene el idioma actual para el contexto actual (debe usarse con I18nContext.current())
   * En lugar de obtenerlo directamente de this.i18n
   */
  getCurrentLanguage(): string {
    // Obtenemos un idioma fallback de la configuración
    return 'es';
  }

  /**
   * Obtiene todos los idiomas disponibles
   */
  getLanguages(): string[] {
    return this.i18n.getSupportedLanguages();
  }
}
