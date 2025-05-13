import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('[validateRequest] Validation failed. Incoming body:', JSON.stringify(req.body, null, 2));
        console.error('[validateRequest] Zod errors:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

export default validateRequest; 