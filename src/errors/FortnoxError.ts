export class FortnoxError extends Error {
  constructor(
    message: string,
    public code?: number,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'FortnoxError';
    Object.setPrototypeOf(this, FortnoxError.prototype);
  }
}

export class AuthenticationError extends FortnoxError {
  constructor(message: string, code?: number, details?: unknown) {
    super(message, code, 401, details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class ValidationError extends FortnoxError {
  constructor(message: string, code?: number, details?: unknown) {
    super(message, code, 400, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends FortnoxError {
  constructor(message: string, code?: number, details?: unknown) {
    super(message, code, 404, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends FortnoxError {
  constructor(message: string, code?: number, details?: unknown) {
    super(message, code, 429, details);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ApiError extends FortnoxError {
  constructor(message: string, code?: number, statusCode?: number, details?: unknown) {
    super(message, code, statusCode, details);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
