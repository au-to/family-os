import pino from 'pino';
import type { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Pino logger instance.
 * Uses pino-pretty for development, standard JSON for production.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }
    : {}),
});

/**
 * Request-scoped logger middleware.
 * Attaches a short reqId for request tracing and logs method/path/status/duration.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const reqId = uuid().slice(0, 8);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any).reqId = reqId;
  const start = Date.now();

  res.on('finish', () => {
    logger.info({
      reqId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
}
