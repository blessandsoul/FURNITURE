import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './libs/logger.js';
import { connectDatabase, disconnectDatabase } from './libs/prisma.js';
import { connectRedis, disconnectRedis } from './libs/redis.js';

async function start(): Promise<void> {
  try {
    const app = await buildApp();

    await connectDatabase();
    await connectRedis();

    await app.listen({ port: env.PORT, host: env.HOST });
    logger.info(`Server listening on http://${env.HOST}:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received, shutting down`);
      try {
        await app.close();
        await disconnectDatabase();
        await disconnectRedis();
        logger.info('Shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error({ err: error }, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error({ err: error }, 'Server failed to start');
    process.exit(1);
  }
}

start();
