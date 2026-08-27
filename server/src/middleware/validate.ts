import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationSource = 'body' | 'query' | 'params';

/**
 * Generic Zod validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), controller.register)
 *   router.get('/links', validate(querySchema, 'query'), controller.list)
 */
export const validate = (schema: ZodSchema, source: ValidationSource = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // Replace the source with parsed (and potentially transformed) data
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error); // Will be caught by errorHandler
      } else {
        next(error);
      }
    }
  };
};
