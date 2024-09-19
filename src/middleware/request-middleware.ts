import {
  RequestHandler, Request, Response, NextFunction
} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Joi from '@hapi/joi';
import { BadRequest, ForbiddenRequest, UnauthorizedRequest } from '../errors';
import { logger } from '../logger';
import { CustomJwtPayload } from '../types/user';

const getMessageFromJoiError = (error: Joi.ValidationError): string | undefined => {
  if (!error.details && error.message) {
    return error.message;
  }
  return error.details && error.details.length > 0 && error.details[0].message
    ? `PATH: [${error.details[0].path}] ;; MESSAGE: ${error.details[0].message}` : undefined;
};

interface HandlerOptions {
  validation?: {
    body?: Joi.ObjectSchema
    query?: Joi.ObjectSchema
  },
  skipJwtAuth?: boolean
  requiredRoles?: string[];
};

const verifyJwtToken = (token: string): Promise<CustomJwtPayload> => new Promise((resolve, reject) => {
  // eslint-disable-next-line consistent-return
  jwt.verify(token, process.env.SECRET!, (err, decoded) => {
    if (err) {
      return reject(err);
    }
    resolve(decoded as CustomJwtPayload);
  });
});

export const relogRequestHandler = (
  handler: RequestHandler,
  options?: HandlerOptions,
// eslint-disable-next-line consistent-return
): RequestHandler => async (req: Request, res: Response, next: NextFunction) => {
  logger.log({
    level: 'info',
    message: req.url
  });
  if (!options?.skipJwtAuth) {
    const token = req.headers['authorization'];

    if (!token) {
      logger.log({
        level: 'info',
        message: 'Auth token is not supplied'
      });
      return next(new UnauthorizedRequest('Auth token is not supplied'));
    }

    try {
      const decoded = await verifyJwtToken(token.replace('Bearer ', '').replace('Bearer', ''));
      req.user = decoded;

      if (options?.requiredRoles) {
        const userRole = decoded?.role;
        if (!userRole || !options.requiredRoles.includes(userRole)) {
          return next(new ForbiddenRequest('Access denied. Insufficient permissions.'));
        }
      }
    } catch (error) {
      logger.log({
        level: 'info',
        message: 'Token Validation Failed'
      });
      return next(new UnauthorizedRequest());
    }
  }
  if (options?.validation?.body) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { error } = options?.validation?.body.validate(req.body);
    if (error != null) {
      return next(new BadRequest(getMessageFromJoiError(error)));
    }
  }
  if (options?.validation?.query) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { error } = options?.validation?.query.validate(req.query);
    if (error != null) {
      return next(new BadRequest(getMessageFromJoiError(error)));
    }
  }

  try {
    await handler(req, res, next);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      logger.log({
        level: 'error',
        message: 'Error in request handler',
        error: err
      });
    }
    next(err);
  }
};

export const checkRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  console.log(req.user);
  const userRole = req.user?.role; // No TypeScript error anymore

  if (!userRole || !roles.includes(userRole)) {
    return next(new ForbiddenRequest('Access denied. You do not have permission to perform this action.'));
  }

  next();
  return null;
};
