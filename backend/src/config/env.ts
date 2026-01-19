import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().default(10),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(5242880),
  MAX_FILES_PER_ITEM: z.coerce.number().default(10),
  ADMIN_EMAIL: z.string().email(),
  CORS_ORIGIN: z.string().default('http://localhost:8080').transform((val) => val.split(',')),
  FRONTEND_URL: z.string().default('http://localhost:8080'),

  // OIDC Configuration
  OIDC_ENABLED: z.coerce.boolean().default(true),
  OIDC_ISSUER: z.string().url().default('https://auth.raphaelcote.com/application/o/friendshare-hub/'),
  OIDC_CLIENT_ID: z.string().optional().default(''),
  OIDC_CLIENT_SECRET: z.string().optional().default(''),
  OIDC_REDIRECT_URI: z.string().optional().default(''),
  OIDC_POST_LOGOUT_REDIRECT_URI: z.string().url().optional(),
  OIDC_SCOPE: z.string().default('openid profile email groups'),
  OIDC_ADMIN_GROUP: z.string().default('friendshare-admins'),
  OIDC_USER_GROUP: z.string().default('friendshare-users'),

  // Email Configuration
  EMAIL_ENABLED: z.coerce.boolean().default(true),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().default('noreply@friendshare.com'),
  SMTP_FROM_NAME: z.string().default('Raphartage Club'),
}).refine(
  (data) => {
    // Si OIDC est activé, les credentials doivent être fournis
    if (data.OIDC_ENABLED) {
      return data.OIDC_CLIENT_ID && data.OIDC_CLIENT_SECRET && data.OIDC_REDIRECT_URI;
    }
    return true;
  },
  {
    message: 'OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, and OIDC_REDIRECT_URI are required when OIDC_ENABLED is true',
    path: ['OIDC_ENABLED'],
  }
);

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
