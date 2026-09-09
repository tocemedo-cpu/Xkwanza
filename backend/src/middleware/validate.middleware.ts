import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

// Validação de entrada nas fronteiras do sistema (protecção contra injecção e dados malformados).
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success) {
      return next(result.error);
    }
    // Reatribui os valores coagidos/com defaults do Zod (ex: paginação) — sem isto, filtros e
    // defaults definidos no schema nunca chegam ao controller/serviço.
    if (result.data.body) req.body = result.data.body;
    if (result.data.query) Object.assign(req.query, result.data.query);
    if (result.data.params) Object.assign(req.params, result.data.params);
    next();
  };
}
