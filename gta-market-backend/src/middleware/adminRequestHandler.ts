import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './errorHandler';
import { MissingTokenError, InvalidTokenError, OutdatedTokenError } from '../errors/AdminError';
import { DBManager } from '../db/manager';

export const MAX_TOKEN_AGE = 30 * 60 * 1000;

export const extractToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return errorHandler(new MissingTokenError(), req, res, next);

  const dbManager = await DBManager.getInstance();
  const tokenData = await dbManager.validateAdminToken(token);
  if (!tokenData) return errorHandler(new InvalidTokenError(), req, res, next);
  
  const now = new Date();
  const tokenAge = tokenData.token_age ? new Date(tokenData.token_age) : now;

  if ((now.getTime() - tokenAge.getTime()) > MAX_TOKEN_AGE) {
    return errorHandler(new OutdatedTokenError(), req, res, next);
  }

  req.params.token = token;
  next();
}
