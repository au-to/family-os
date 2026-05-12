import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

/**
 * Global Express error handler.
 * Catches any unhandled error and returns a consistent JSON response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ err }, '未捕获的错误');

  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: '服务器内部错误',
    ...(isDev ? { details: err.message } : {}),
  });
}
