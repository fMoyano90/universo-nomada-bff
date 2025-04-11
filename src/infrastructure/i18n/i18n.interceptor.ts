import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslationService } from './translation.service';
import { I18nContext } from 'nestjs-i18n';

/**
 * Interceptor que traduce los mensajes de error automáticamente
 * usando el idioma de la solicitud actual
 */
@Injectable()
export class I18nInterceptor implements NestInterceptor {
  constructor(private readonly translationService: TranslationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          const i18n = I18nContext.current();

          // Si tenemos una clave de traducción en el formato 'common.some.key'
          if (error.message && error.message.startsWith('common.')) {
            const translatedMessage = i18n
              ? i18n.t(error.message)
              : this.translationService.translate(error.message);

            // Crear una nueva excepción con el mensaje traducido
            const newError = new HttpException(
              translatedMessage,
              error.getStatus(),
            );

            // Preservar la respuesta original y actualizar el mensaje
            const response = error.getResponse();
            if (typeof response === 'object') {
              Object.assign(newError.getResponse(), response, {
                message: translatedMessage,
              });
            }

            return throwError(() => newError);
          }
        }

        return throwError(() => error);
      }),
    );
  }
}
