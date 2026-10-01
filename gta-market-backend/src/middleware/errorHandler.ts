import { Request, Response, NextFunction } from 'express';
import { RequestError } from '../errors/AppError';
import { getLogger } from '../logger/logger';

const logger = getLogger("middleware:error");

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof RequestError) {
    return res.status(err.status).json({
      error: true,
      message: err.message
    });
  }

  const relevantMethods = ['POST', 'PUT'];
  if (relevantMethods.includes(req.method) && err instanceof SyntaxError) {
    return res.status(400).json({
      error: true,
      message: err.message
    })
  }

  // TODO: If this was deployed in different environments
  // it would make sense to not always log the error to the console
  // so internals are not leaked.
  logger.error(err);
  return res.status(500).json({
    error: true,
    message: "Internal Server Error"
  });
}


