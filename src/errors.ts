import type { ErrorResponse } from './types.js';

export function toErrorResponse(status: number, code: string, message: string): ErrorResponse {
  return { error: { status, code, message } };
}

export function notFound(resource: string, id: string): ErrorResponse {
  return toErrorResponse(404, 'NOT_FOUND', `${resource} with id '${id}' not found`);
}

export function badRequest(message: string): ErrorResponse {
  return toErrorResponse(400, 'BAD_REQUEST', message);
}

export function unauthorized(message: string): ErrorResponse {
  return toErrorResponse(401, 'UNAUTHORIZED', message);
}

export function forbidden(message: string): ErrorResponse {
  return toErrorResponse(403, 'FORBIDDEN', message);
}

export function rateLimited(): ErrorResponse {
  return toErrorResponse(429, 'RATE_LIMITED', 'Too many requests');
}
