import { Issuer, Client, generators, TokenSet } from 'openid-client';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface OIDCUserInfo {
  sub: string;
  email?: string;
  name: string;
  preferred_username?: string;
  groups?: string[];
}

class OIDCService {
  private client: Client | null = null;
  private issuer: Issuer | null = null;

  async initialize(): Promise<void> {
    if (!env.OIDC_ENABLED) {
      logger.info('OIDC is disabled');
      return;
    }

    try {
      // Discover OIDC endpoints from issuer
      this.issuer = await Issuer.discover(env.OIDC_ISSUER);

      logger.info('OIDC Issuer discovered', {
        issuer: this.issuer.metadata.issuer,
        authorization_endpoint: this.issuer.metadata.authorization_endpoint,
        token_endpoint: this.issuer.metadata.token_endpoint,
      });

      // Create OIDC client
      this.client = new this.issuer.Client({
        client_id: env.OIDC_CLIENT_ID,
        client_secret: env.OIDC_CLIENT_SECRET,
        redirect_uris: [env.OIDC_REDIRECT_URI],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_basic',
      });

      logger.info('OIDC client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize OIDC client', error);
      throw error;
    }
  }

  getClient(): Client {
    if (!this.client) {
      throw new Error('OIDC client not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Generate authorization URL with PKCE
   */
  generateAuthorizationUrl(): { url: string; codeVerifier: string; state: string } {
    const client = this.getClient();

    // Generate PKCE parameters
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    // Generate state for CSRF protection
    const state = generators.state();

    const url = client.authorizationUrl({
      scope: env.OIDC_SCOPE,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
    });

    return { url, codeVerifier, state };
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
    state: string,
    receivedState: string
  ): Promise<TokenSet> {
    // Validate state to prevent CSRF
    if (state !== receivedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    const client = this.getClient();

    const tokenSet = await client.callback(
      env.OIDC_REDIRECT_URI,
      { code, state: receivedState },
      { code_verifier: codeVerifier, state }
    );

    return tokenSet;
  }

  /**
   * Get user information from OIDC provider
   */
  async getUserInfo(accessToken: string): Promise<OIDCUserInfo> {
    const client = this.getClient();
    const userinfo = await client.userinfo(accessToken);

    return userinfo as OIDCUserInfo;
  }

  /**
   * Map LDAP groups to application role
   */
  mapGroupsToRole(groups?: string[]): 'USER' | 'ADMIN' {
    if (!groups || groups.length === 0) {
      return 'USER';
    }

    // Check for admin group
    if (groups.includes(env.OIDC_ADMIN_GROUP)) {
      return 'ADMIN';
    }

    // Check for user group
    if (groups.includes(env.OIDC_USER_GROUP)) {
      return 'USER';
    }

    // Default to USER
    return 'USER';
  }

  /**
   * Generate end session URL for logout
   */
  getEndSessionUrl(idToken?: string): string {
    const client = this.getClient();

    return client.endSessionUrl({
      id_token_hint: idToken,
      post_logout_redirect_uri: env.OIDC_POST_LOGOUT_REDIRECT_URI || env.FRONTEND_URL,
    });
  }
}

export const oidcService = new OIDCService();
