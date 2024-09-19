import { JwtPayload } from 'jsonwebtoken';

export interface UserPayload {
    id: string;
    role: string;
    email: string;
}

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
  email: string;
}
