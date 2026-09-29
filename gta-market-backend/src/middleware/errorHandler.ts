import { Request, Response, NextFunction } from 'express';
import { RequestError } from '../errors/AppError';


export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof RequestError) {
    return res.status(err.status).json({
      error: true,
      message: err.message
    });
  }

  // TODO: If this was deployed in different environments
  // it would make sense to not always log the error to the console
  // so internals are not leaked.
  console.error(err);
  return res.status(500).json({
    error: true,
    message: "Internal Server Error"
  });
}


