import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { queueEvent } from '../services/queue';

interface EventPayload {
  event_name: string;
  account_id?: string;
  [key: string]: any; // Allow any additional properties
}

interface BatchEventsPayload {
  events: EventPayload[];
}

export const eventsRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Single event ingestion
  fastify.post<{ Body: EventPayload }>('/events', async (request, reply) => {
    const event = request.body;

    // Minimal validation - only event_name is required
    if (!event.event_name || typeof event.event_name !== 'string') {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'event_name is required and must be a string',
      });
    }

    // Enrich event with metadata
    const enrichedEvent = {
      ...event,
      event_id: event.event_id || uuidv4(),
      timestamp: event.timestamp || new Date().toISOString(),
      source: event.source || 'backend',
      received_at: new Date().toISOString(),
      api_key: request.apiKey, // Track which API key sent the event
    };

    try {
      // Queue the event (async processing)
      await queueEvent(enrichedEvent);

      fastify.log.info({
        event_id: enrichedEvent.event_id,
        event_name: enrichedEvent.event_name,
        account_id: enrichedEvent.account_id,
      }, 'Event queued');

      return reply.code(202).send({
        status: 'accepted',
        event_id: enrichedEvent.event_id,
        message: 'Event queued for processing',
      });
    } catch (error) {
      fastify.log.error({ error, event }, 'Failed to queue event');
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to queue event',
      });
    }
  });

  // Batch event ingestion
  fastify.post<{ Body: BatchEventsPayload }>('/events/batch', async (request, reply) => {
    const { events } = request.body;

    // Validate batch
    if (!Array.isArray(events) || events.length === 0) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'events must be a non-empty array',
      });
    }

    if (events.length > 1000) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Maximum 1000 events per batch',
      });
    }

    // Validate each event (minimal)
    const invalidEvents = events.filter(e => !e.event_name || typeof e.event_name !== 'string');
    if (invalidEvents.length > 0) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: `${invalidEvents.length} events missing event_name`,
      });
    }

    // Enrich all events
    const enrichedEvents = events.map(event => ({
      ...event,
      event_id: event.event_id || uuidv4(),
      timestamp: event.timestamp || new Date().toISOString(),
      source: event.source || 'backend',
      received_at: new Date().toISOString(),
      api_key: request.apiKey,
    }));

    try {
      // Queue all events
      await Promise.all(enrichedEvents.map(event => queueEvent(event)));

      fastify.log.info({
        batch_size: enrichedEvents.length,
        event_names: [...new Set(enrichedEvents.map(e => e.event_name))],
      }, 'Batch queued');

      return reply.code(202).send({
        status: 'accepted',
        count: enrichedEvents.length,
        message: 'Events queued for processing',
      });
    } catch (error) {
      fastify.log.error({ error, batch_size: events.length }, 'Failed to queue batch');
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to queue events',
      });
    }
  });

  // Get event schema (documentation endpoint)
  fastify.get('/events/schema', async (request, reply) => {
    return {
      description: 'Event ingestion schema - very flexible!',
      required: ['event_name'],
      recommended: ['account_id', 'timestamp'],
      optional: ['Any other fields you want to track'],
      examples: {
        order_created: {
          event_name: 'order_created',
          account_id: 'account_123',
          order_id: 'ORD-456',
          amount: 99.99,
          currency: 'USD',
          customer_id: 'CUST-789',
        },
        subscription_canceled: {
          event_name: 'subscription_canceled',
          account_id: 'account_123',
          subscription_id: 'SUB-456',
          cancel_reason: 'customer_request',
          mrr_impact: -29.99,
        },
      },
    };
  });
};


