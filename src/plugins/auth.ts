import { FastifyPluginAsync } from 'fastify';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyRequest {
    apiKey?: string;
  }
}

export const authPlugin: FastifyPluginAsync = async (fastify: { decorateRequest: (arg0: string, arg1: null) => void; addHook: (arg0: string, arg1: (request: { url: string; headers: { [x: string]: string; }; apiKey: string; }, reply: { code: (arg0: number) => { (): any; new(): any; send: { (arg0: { error: string; message: string; }): any; new(): any; }; }; }) => Promise<any>) => void; }) => {
  fastify.decorateRequest('apiKey', null);

  fastify.addHook('onRequest', async (request: { url: string; headers: { [x: string]: string; }; apiKey: string; }, reply: { code: (arg0: number) => { (): any; new(): any; send: { (arg0: { error: string; message: string; }): any; new(): any; }; }; }) => {
    // Skip auth for health check
    if (request.url === '/health') {
      return;
    }

    // Get API key from header
    const apiKey = request.headers['x-api-key'] || 
                   request.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'API key required. Provide via X-API-Key header or Authorization: Bearer <key>',
      });
    }

    // Validate API key
    if (!config.API_KEYS.includes(apiKey as string)) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Invalid API key',
      });
    }

    // Store validated API key on request
    request.apiKey = apiKey as string;
  });
};

