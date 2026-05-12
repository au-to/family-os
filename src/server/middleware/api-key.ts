import type { Request, Response, NextFunction } from 'express';

/**
 * Optional API-key authentication middleware.
 *
 * - If `API_KEY` env var is NOT set → pass-through (no auth).
 * - If `API_KEY` is set → every request must include `x-api-key` header
 *   matching the env var, except `/api/health` which is always open.
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return next();
  }

  // Always allow health checks
  if (req.path === '/api/health') {
    return next();
  }

  const provided = req.headers['x-api-key'] as string | undefined;
  if (!provided || provided !== apiKey) {
    res.status(401).json({ error: '未授权访问' });
    return;
  }

  next();
}
