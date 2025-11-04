import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { authPlugin } from './plugins/auth';
import { eventsRoutes } from './routes/events';
import { healthRoutes } from './routes/health';

const fastify = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    transport: config.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
});

async function start() {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: true, // Allow all origins (adjust in production)
      credentials: true,
    });

    // Register auth plugin
    await fastify.register(authPlugin);

    // Register routes
    await fastify.register(healthRoutes);
    await fastify.register(eventsRoutes, { prefix: '/api/v1' });

    // Start server
    await fastify.listen({
      port: config.PORT,
      host: config.HOST,
    });

    console.log(`
    🚀 Apollo Analytics Backend
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Server running at: http://${config.HOST}:${config.PORT}
    Environment: ${config.NODE_ENV}
    API Keys configured: ${config.API_KEYS.length}
    
    Endpoints:
    - POST /api/v1/events (ingestion)
    - GET  /health (health check)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\nReceived ${signal}, closing server gracefully...`);
    await fastify.close();
    process.exit(0);
  });
});

start();


