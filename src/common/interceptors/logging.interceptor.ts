import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';

    // Log request details
    this.logger.log(
      `Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const response = context.switchToHttp().getResponse<Response>();
          const delay = Date.now() - now;
          this.logger.log(
            `Response: ${method} ${url} - ${response.statusCode} - ${delay}ms`,
          );
        },
        error: (error: Error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `Error: ${method} ${url} - ${error.message} - ${delay}ms`,
          );
        },
      }),
    );
  }
}
