import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const startServer = async () => {
  await connectDB();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[Server] Branded Link Hub API running on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[Server] Redirect engine active at http://localhost:${env.PORT}/r/:shortCode`);
    console.log(`[Server] REST API base: http://localhost:${env.PORT}/api/v1`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
