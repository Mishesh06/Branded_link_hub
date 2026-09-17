import crypto from 'crypto';

const BASE62_CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generates a random 6-character alphanumeric short code.
 * 62^6 = 56,800,235,584 possible unique combinations.
 */
export const generateShortCode = (length = 6): string => {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARSET[bytes[i] % BASE62_CHARSET.length];
  }
  return result;
};

/**
 * Validates whether a custom slug matches acceptable criteria.
 * Alphanumeric, hyphens, underscores, between 3 and 30 characters.
 */
export const isValidCustomSlug = (slug: string): boolean => {
  const slugRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return slugRegex.test(slug);
};

/**
 * Reserved slugs that cannot be used as custom vanity slugs.
 */
export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'auth',
  'bio',
  'dashboard',
  'login',
  'signup',
  'r',
  'settings',
  'static',
  'assets',
  'favicon.ico',
  'health',
  'privacy',
  'terms'
]);
