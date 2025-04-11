import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);
  private readonly limiter: any;

  constructor(private configService: ConfigService) {
    const ttl = configService.get<number>('THROTTLE_TTL', 60);
    const limit = configService.get<number>('THROTTLE_LIMIT', 100);

    // Create a more configurable rate limiter
    this.limiter = rateLimit({
      windowMs: ttl * 1000, // Convert to milliseconds
      max: limit, // Maximum number of requests
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      skipSuccessfulRequests: false, // Don't count successful requests

      // Custom handler for rate limit reached
      handler: (req: Request, res: Response) => {
        this.logger.warn(
          `Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`,
        );

        res.status(429).json({
          success: false,
          error: {
            statusCode: 429,
            errorCode: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
            timestamp: new Date().toISOString(),
            path: req.url,
          },
        });
      },

      // Determine request uniqueness - customize for your needs
      keyGenerator: (req: Request) => {
        // Use a combination of IP and user ID if authenticated
        const userId = (req as any).user?.id || '';
        return userId ? `${req.ip}-${userId}` : req.ip;
      },

      // Skip rate limiting for certain requests (e.g., internal health checks)
      skip: (req: Request) => {
        return req.path === '/health' || req.path === '/api/docs';
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}
