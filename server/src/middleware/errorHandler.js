import { ZodError } from 'zod';
import { errorResponse } from '../utils/responseHelper.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 400, 'Validation failed', formattedErrors);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse(res, 400, 'Mongoose validation failed', errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, 409, `A record with this ${field} already exists.`);
  }

  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Invalid ID format for ${err.path}`);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Invalid or expired authentication session');
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);

  return errorResponse(res, statusCode, message);
};
