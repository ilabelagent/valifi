
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const create = {
  badRequest: (code, message, details) => new HttpError(400, code, message, details),
  unauthorized: (code, message, details) => new HttpError(401, code, message, details),
  forbidden: (code, message, details) => new HttpError(403, code, message, details),
  conflict: (code, message, details) => new HttpError(409, code, message, details),
  tooMany: (code, message, details) => new HttpError(429, code, message, details),
  server: (message, details) => new HttpError(500, 'SERVER_ERROR', message, details),
};
