/**
 * Base of the single domain error hierarchy (ARCHITECTURE.md §9 / ROADMAP.md
 * §13). Every error a module deliberately throws — as opposed to an
 * unexpected bug — should extend this, so the Fastify error handler can map
 * it to a consistent `{ error: { code, message, details } }` response
 * without each module reinventing its own error shape.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.details = details;
    Error.captureStackTrace?.(this, new.target);
  }
}

/**
 * Shared status/code constants for the two hierarchy members whose HTTP
 * behavior is also produced by framework-level code paths (Zod/Fastify
 * validation errors, and the error handler's generic fallback). Keeping the
 * literals here lets those branches reference the class definitions instead
 * of duplicating them, so the class and the emitted response cannot drift.
 */
export const VALIDATION_ERROR_STATUS = 400;
export const VALIDATION_ERROR_CODE = 'VALIDATION_ERROR';
export const INTERNAL_ERROR_STATUS = 500;
export const INTERNAL_ERROR_CODE = 'INTERNAL_ERROR';

export class ValidationError extends AppError {
  readonly statusCode = VALIDATION_ERROR_STATUS;
  readonly code = VALIDATION_ERROR_CODE;
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
}

/**
 * Raised when a Soroban RPC call or contract invocation fails. Deliberately
 * distinct from ValidationError etc. — a 502-class failure reflects the
 * upstream chain/RPC, not a client mistake. Callers can attach the raw
 * contract error discriminant (see PHASE_1_DOMAIN_ANALYSIS.md §3 on the
 * mixed FaniLabError/contract-local-error/bare-panic conventions on-chain).
 */
export class BlockchainError extends AppError {
  readonly statusCode = 502;
  readonly code = 'BLOCKCHAIN_ERROR';
}

export class InternalError extends AppError {
  readonly statusCode = INTERNAL_ERROR_STATUS;
  readonly code = INTERNAL_ERROR_CODE;
}
