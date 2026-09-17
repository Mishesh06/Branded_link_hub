import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Creates a salted SHA-256 hash of an IP address to preserve privacy while enabling
 * unique visitor metrics calculation without storing PII (GDPR/CCPA compliant).
 */
export const hashIpAddress = (ip: string): string => {
  const normalizedIp = ip.trim().replace(/^::ffff:/, ''); // normalize IPv4-mapped IPv6
  return crypto
    .createHmac('sha256', env.IP_HASH_SALT)
    .update(normalizedIp)
    .digest('hex');
};
