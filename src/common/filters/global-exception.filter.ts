import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TypeORMError } from 'typeorm';
import { I18nContext } from 'nestjs-i18n';
import { TranslationService } from '../../infrastructure/i18n/translation.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    @Optional()
    @Inject('TranslationService')
    private readonly translationService?: TranslationService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get i18n context
    const i18n = I18nContext.current();

    // Log detailed error info
    this.logger.error(
      `Exception: ${
        exception instanceof Error ? exception.message : 'Unknown error'
      }`,
      exception instanceof Error ? exception.stack : undefined,
      `${request.method} ${request.url}`,
    );

    // Determine HTTP status and error message
    let status: HttpStatus;
    let message: string;
    let errorCode: string;

    if (exception instanceof HttpException) {
      // NestJS HTTP Exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message || exception.message
          : exception.message;
      errorCode = `HTTP_${status}`;

      // Try to translate the message if it's a translation key
      if (
        message &&
        typeof message === 'string' &&
        message.startsWith('common.')
      ) {
        message = this.translateMessage(message, i18n);
      }
    } else if (exception instanceof TypeORMError) {
      // Database-related errors
      status = HttpStatus.BAD_REQUEST;
      message = this.translateMessage('common.errors.database_error', i18n);
      errorCode = 'DB_ERROR';

      // Handle specific database errors
      if (exception.message.includes('duplicate key')) {
        message = this.translateMessage('common.errors.duplicate_entry', i18n);
        errorCode = 'DUPLICATE_ENTRY';
      } else if (
        exception.message.includes('violates foreign key constraint')
      ) {
        message = this.translateMessage(
          'common.errors.foreign_key_violation',
          i18n,
        );
        errorCode = 'FOREIGN_KEY_VIOLATION';
      }
    } else if (exception instanceof Error) {
      // Generic JS/TS errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        process.env.NODE_ENV === 'production'
          ? this.translateMessage('common.errors.internal_server_error', i18n)
          : exception.message;
      errorCode = 'SERVER_ERROR';
    } else {
      // Fallback for unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.translateMessage(
        'common.errors.internal_server_error',
        i18n,
      );
      errorCode = 'UNKNOWN_ERROR';
    }

    // Send standardized response
    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        errorCode,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }

  /**
   * Traduce un mensaje usando i18n o el servicio de traducción si está disponible
   */
  private translateMessage(key: string, i18n?: I18nContext): string {
    // Usar el contexto i18n si está disponible
    if (i18n) {
      return i18n.t(key);
    }

    // Si no hay contexto i18n, intentar usar el servicio de traducción
    if (this.translationService) {
      return this.translationService.translate(key);
    }

    // Fallback: devolver la clave original
    return key;
  }
}
