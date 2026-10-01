import { Request, Response, NextFunction } from 'express';
import { IncompletePayloadError } from '../errors/AppError';
import { InvalidAdminError, InvalidTokenError, OutdatedTokenError } from '../errors/AdminError';
import { DBManager } from '../db/manager';
import { MAX_TOKEN_AGE } from '../middleware/adminRequestHandler';


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  if (!username || !password) return next(new IncompletePayloadError({
    "username": username ?? null,
    "password": password ? "[REDACTED]" : null
  }));

  const dbManager = await DBManager.getInstance();
  const token = await dbManager.updateAdminToken(username, password);
  if (!token) return next(new InvalidAdminError());

  return res.status(200).json({token});
}


export const getToken = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  if (!username || !password) return next(new IncompletePayloadError({
    "username": username ?? null,
    "password": password ? "[REDACTED]" : null
  }));

  const dbManager = await DBManager.getInstance();
  const tokenData = await dbManager.getAdminToken(username, password);
  if (!tokenData) return next(new InvalidAdminError());
  if (!tokenData.token || !tokenData.token_age) return next(new InvalidTokenError());
  
  const now = new Date();
  const tokenAge = new Date(tokenData.token_age);
  if (now.getTime() - tokenAge.getTime() > MAX_TOKEN_AGE) {
    return next(new OutdatedTokenError());
  }

  return res.status(200).json({
    token: tokenData.token,
    createdAt: tokenData.token_age
  });
}
