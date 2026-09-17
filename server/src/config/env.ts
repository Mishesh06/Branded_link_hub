import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/branded_link_hub',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_super_secure_key_12345',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_super_secure_key_67890',
  IP_HASH_SALT: process.env.IP_HASH_SALT || 'dev_ip_hash_salt_pepper_99999',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  BASE_URL: process.env.BASE_URL || 'http://localhost:5001',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
