import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { oidcService } from './oidc.service.js';
import { logger } from '../utils/logger.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface OIDCUserInfo {
  sub: string;
  email: string;
  name: string;
  groups?: string[];
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

  // SSO user synchronization
  async syncOIDCUser(userInfo: OIDCUserInfo): Promise<any> {
    const { sub, email, name, groups } = userInfo;

    // Map groups to role
    const role = oidcService.mapGroupsToRole(groups);

    logger.info('Syncing OIDC user', { sub, email, name, role, groups });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { authentikId: sub },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          name,
          role,
          status: 'APPROVED', // Auto-approve SSO users
          authProvider: 'AUTHENTIK',
          lastLoginAt: new Date(),
        },
      });

      logger.info('Updated existing OIDC user', { userId: user.id });
    } else {
      // Check if email already exists (legacy user)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Migrate legacy user to SSO
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            authentikId: sub,
            name, // Update name from OIDC
            role, // Update role based on groups
            status: 'APPROVED', // Auto-approve
            authProvider: 'AUTHENTIK',
            lastLoginAt: new Date(),
          },
        });

        logger.info('Migrated legacy user to OIDC', { userId: user.id });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name,
            role,
            authentikId: sub,
            authProvider: 'AUTHENTIK',
            status: 'APPROVED', // Auto-approve SSO users
            passwordHash: null, // No password for SSO users
            lastLoginAt: new Date(),
          },
        });

        logger.info('Created new OIDC user', { userId: user.id });
      }
    }

    return user;
  },
};
