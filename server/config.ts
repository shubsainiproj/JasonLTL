import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  GLT_PORTAL_URL: 'https://myportal.goglt.com',
  GLT_LOGIN_URL: 'https://myportal.goglt.com/login',
  GLT_API_URL: 'https://api-portal.goglt.com',
  GLT_QUOTE_URL: 'https://myportal.goglt.com/quote-book/all-options',
  // Credentials strictly server-side
  EMAIL: process.env.EMAIL || process.env.GOGLT_EMAIL || process.env.GLT_EMAIL || 'Jason@cylltd.com',
  PASS: process.env.PASS || process.env.GOGLT_PASSWORD || process.env.GLT_PASS || process.env.PASSWORD || '',
  PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  STORAGE_DIR: path.resolve(process.cwd(), 'storage'),
  SESSION_FILE: path.resolve(process.cwd(), 'storage', 'glt-session.json'),
};

// Ensure storage dir exists
if (!fs.existsSync(CONFIG.STORAGE_DIR)) {
  fs.mkdirSync(CONFIG.STORAGE_DIR, { recursive: true });
}

export function getMaskedEmail(): string {
  const email = CONFIG.EMAIL;
  if (!email) return 'Not configured';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name.substring(0, 2)}***${name.substring(name.length - 1)}` : '***';
  return `${maskedName}@${domain}`;
}

export function isCredentialsConfigured(): boolean {
  return Boolean(CONFIG.EMAIL && CONFIG.PASS && CONFIG.PASS.trim().length > 0);
}
