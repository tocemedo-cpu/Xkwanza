import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

// Validação de entrada nas fronteiras do sistema (protecção contra injecção e dados malformados).
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success) {
      return next(result.error);
    }
    if (result.data.body) req.body = result.data.body;
    next();
  };
}
