import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TEST_DB_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/branded_link_hub_test';

export const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export const disconnectTestDB = async () => {
  await clearTestDB();
  await mongoose.disconnect();
};

export const getCookies = (res: any): string[] => {
  const cookies = res.headers['set-cookie'];
  if (!cookies) return [];
  if (Array.isArray(cookies)) return cookies;
  return [cookies];
};

