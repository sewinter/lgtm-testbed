import type { Request, Response, NextFunction } from 'express';
import { badRequest } from '../errors.js';

interface ValidationSchema {
  required?: string[];
  types?: Record<string, 'string' | 'number' | 'boolean'>;
}

export function withValidation(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json(badRequest('Request body must be a JSON object'));
    }

    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in body) || body[field] === undefined || body[field] === null) {
          return res.status(400).json(badRequest(`Missing required field: ${field}`));
        }
      }
    }

    if (schema.types) {
      for (const [field, expectedType] of Object.entries(schema.types)) {
        if (field in body && typeof body[field] !== expectedType) {
          return res.status(400).json(
            badRequest(`Field '${field}' must be of type ${expectedType}`),
          );
        }
      }
    }

    next();
  };
}
