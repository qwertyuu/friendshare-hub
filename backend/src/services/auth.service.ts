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

    // Find or create user by authentikId
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
          lastLoginAt: new Date(),
        },
      });

      logger.info('Updated existing SSO user', { userId: user.id });
    } else {
      // Check if email already exists (link existing account)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link existing user to SSO
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            authentikId: sub,
            name,
            role,
            lastLoginAt: new Date(),
          },
        });

        logger.info('Linked existing user to SSO', { userId: user.id });
      } else {
        // Create new SSO user
        user = await prisma.user.create({
          data: {
            email,
            name,
            role,
            authentikId: sub,
            lastLoginAt: new Date(),
          },
        });

        logger.info('Created new SSO user', { userId: user.id });
      }
    }

    return user;
  },
};
