import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Middleware factory: validates `req.body` or `req.query` against a Zod schema.
 * On failure returns 400 with field-level error details.
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        error: '数据验证失败',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    // Replace raw input with parsed (and defaulted) data
    req[source] = result.data as Record<string, unknown>;
    next();
  };
}
