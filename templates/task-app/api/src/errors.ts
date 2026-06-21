/** Structured domain errors mapped to HTTP status codes at the boundary. */

export class ValidationError extends Error {
  readonly status = 400 as const;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  readonly status = 404 as const;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RepositoryError extends Error {
  readonly status = 502 as const;
  constructor(
    message: string,
    readonly reason?: unknown,
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
