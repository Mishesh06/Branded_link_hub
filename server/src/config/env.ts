import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

const DEV_DEFAULTS = {
  JWT_ACCESS_SECRET: 'dev_jwt_access_secret_super_secure_key_12345',
  JWT_REFRESH_SECRET: 'dev_jwt_refresh_secret_super_secure_key_67890',
  IP_HASH_SALT: 'dev_ip_hash_salt_pepper_99999'
};

// Strict production validation: fail fast if required secrets are missing or using dev fallbacks
if (isProduction) {
  const missingSecrets: string[] = [];
  const accessSecret = process.env.JWT_ACCESS_SECRET?.trim();
  const refreshSecret = process.env.JWT_REFRESH_SECRET?.trim();
  const ipSalt = process.env.IP_HASH_SALT?.trim();

  if (!accessSecret || accessSecret === DEV_DEFAULTS.JWT_ACCESS_SECRET) {
    missingSecrets.push('JWT_ACCESS_SECRET');
  }
  if (!refreshSecret || refreshSecret === DEV_DEFAULTS.JWT_REFRESH_SECRET) {
    missingSecrets.push('JWT_REFRESH_SECRET');
  }
  if (!ipSalt || ipSalt === DEV_DEFAULTS.IP_HASH_SALT) {
    missingSecrets.push('IP_HASH_SALT');
  }

  if (missingSecrets.length > 0) {
    throw new Error(
      `[FATAL] Production configuration error: Missing required secret(s): ${missingSecrets.join(
        ', '
      )}. Cannot start in production without explicitly configured secrets.`
    );
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/branded_link_hub',
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET ||
    (isProduction ? '' : DEV_DEFAULTS.JWT_ACCESS_SECRET),
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    (isProduction ? '' : DEV_DEFAULTS.JWT_REFRESH_SECRET),
  IP_HASH_SALT:
    process.env.IP_HASH_SALT ||
    (isProduction ? '' : DEV_DEFAULTS.IP_HASH_SALT),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  BASE_URL: process.env.BASE_URL || 'http://localhost:5001',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
