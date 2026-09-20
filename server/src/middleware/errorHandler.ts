import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  // Handle Mongo Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return res.status(409).json({
      success: false,
      message: `A record with that ${field} ('${value}') already exists.`
    });
  }

  // Handle Mongoose CastError or BSONError (invalid ObjectId)
  if (
    err.name === 'CastError' ||
    err.name === 'BSONError' ||
    err.name === 'BSONTypeError' ||
    err.constructor?.name === 'BSONError' ||
    err.constructor?.name === 'BSONTypeError' ||
    (typeof err.message === 'string' &&
      (err.message.includes('must be a single String of 12 bytes or a string of 24 hex characters') ||
        err.message.includes('Argument passed in must be a single String') ||
        err.message.includes('input must be a 24 character hex string') ||
        err.message.includes('BSONError')))
  ) {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: ${err.value || err.message}`
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token'
    });
  }

  // Known AppError
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Unexpected internal server error
  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred'
        : err.message || 'Internal server error'
  });
};
