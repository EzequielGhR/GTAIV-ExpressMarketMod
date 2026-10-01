import { RequestError } from './AppError';


export class InvalidAdminError extends RequestError {
  constructor() {
    super(404, "Invalid Admin Username or Password");
  }
}

export class OutdatedTokenError extends RequestError {
  constructor() {
    super(400, "You've been logged out. Log back in");
  }
}

export class MissingTokenError extends RequestError {
  constructor() {
    super(401, "Token not present in the auth headers");
  }
}

export class InvalidTokenError extends RequestError {
  constructor() {
    super(404, "Invalid token provided");
  }
}
