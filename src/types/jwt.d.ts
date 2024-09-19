import { UserPayload } from './user';

declare global {
  namespace jsonwebtoken {
    interface JwtPayload {
      user?: UserPayload;
    }
  }
}
