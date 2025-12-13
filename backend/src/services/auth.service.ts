import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateToken(userId: string, email: string, role: 'USER' | 'ADMIN'): string {
    const payload: TokenPayload = {
      userId,
      email,
      role,
    };

    return jwt.sign(
      payload,
      env.JWT_SECRET as string,
      { expiresIn: env.JWT_EXPIRES_IN } as any
    );
  },

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },
};
