import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { authService } from '../services/auth.service.js';
import { oidcService } from '../services/oidc.service.js';
import { UnauthorizedError, BadRequestError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const authController = {
  /**
   * Initiate OIDC login flow
   * GET /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      if (!env.OIDC_ENABLED) {
        throw new BadRequestError('SSO authentication is not enabled');
      }

      const { url, codeVerifier, state } = oidcService.generateAuthorizationUrl();

      // Store PKCE parameters in session/cookie for callback
      res.cookie('oidc_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });

      res.cookie('oidc_state', state, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });

      return res.json({ authorizationUrl: url });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle OIDC callback
   * GET /api/auth/callback
   */
  async callback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state: receivedState } = req.query;

      if (!code || typeof code !== 'string') {
        throw new BadRequestError('Authorization code is required');
      }

      if (!receivedState || typeof receivedState !== 'string') {
        throw new BadRequestError('State parameter is required');
      }

      // Retrieve PKCE parameters from cookies
      const codeVerifier = req.cookies.oidc_code_verifier;
      const state = req.cookies.oidc_state;

      if (!codeVerifier || !state) {
        throw new UnauthorizedError('Missing PKCE parameters. Please try logging in again.');
      }

      // Exchange code for tokens
      const tokenSet = await oidcService.exchangeCodeForTokens(
        code,
        codeVerifier,
        state,
        receivedState
      );

      // Get user information
      const userInfo = await oidcService.getUserInfo(tokenSet.access_token!);

      // Sync/create user in database
      const user = await authService.syncOIDCUser(userInfo);

      // Generate application JWT token for session management
      const appToken = authService.generateToken(user.id, user.email, user.role);

      // Clear OIDC cookies
      res.clearCookie('oidc_code_verifier');
      res.clearCookie('oidc_state');

      // Set application session cookie
      res.cookie('token', appToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Store ID token for logout (optional)
      if (tokenSet.id_token) {
        res.cookie('id_token', tokenSet.id_token, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      // Redirect to frontend
      return res.redirect(`${env.FRONTEND_URL}/browse`);
    } catch (error) {
      logger.error('OIDC callback error', error);
      // Redirect to frontend with error
      return res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
    }
  },

  /**
   * Logout (both local and SSO session)
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const idToken = req.cookies.id_token;

      // Clear application cookies
      res.clearCookie('token');
      res.clearCookie('id_token');

      // Generate SSO logout URL if ID token available
      let ssoLogoutUrl: string | null = null;
      if (idToken && env.OIDC_ENABLED) {
        try {
          ssoLogoutUrl = oidcService.getEndSessionUrl(idToken);
        } catch (error) {
          logger.error('Failed to generate SSO logout URL', error);
        }
      }

      return res.json({
        message: 'Logout successful',
        ssoLogoutUrl, // Frontend can redirect to this URL to end SSO session
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Legacy password registration (DEPRECATED - to be removed)
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(410).json({
        error: 'Gone',
        message: 'Password-based registration is no longer available. Please use SSO login.',
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
