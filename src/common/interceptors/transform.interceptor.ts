import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const now = new Date().toISOString();
    const requestPath = request.path;

    return next.handle().pipe(
      map((data) => {
        // Si los datos ya tienen una estructura específica de respuesta, no los envolveremos en otra estructura
        if (data && data.success !== undefined && data.data !== undefined) {
          return data;
        }

        // Determinar si estamos en una ruta de testimonios
        const isTestimonialRoute =
          requestPath.includes('/testimonials') ||
          requestPath.includes('/testimonios');

        // Para rutas de testimonios, enviar los datos directamente
        if (isTestimonialRoute) {
          return data;
        }

        // Para otras rutas, mantener el formato estándar
        return {
          success: true,
          data,
          timestamp: now,
          path: requestPath,
        };
      }),
    );
  }
}
