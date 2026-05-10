/**
 * Error handler para servicios
 */

export class ServiceError extends Error {
  constructor(message, code = 'SERVICE_ERROR') {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }

  static from(error, context) {
    const message = context ? `${context}: ${error.message}` : error.message;
    const err = new ServiceError(message, error.code || 'UNKNOWN');
    err.stack = error.stack;
    return err;
  }
}
