import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '../config';

// Initialize SQS client (only if configured)
let sqsClient: SQSClient | null = null;

if (config.AWS_REGION && config.SQS_QUEUE_URL) {
  sqsClient = new SQSClient({ region: config.AWS_REGION });
}

/**
 * Queue an event for processing
 * In development: just logs the event
 * In production: sends to SQS
 */
export async function queueEvent(event: any): Promise<void> {
  // If SQS is configured, send to queue
  if (sqsClient && config.SQS_QUEUE_URL) {
    const command = new SendMessageCommand({
      QueueUrl: config.SQS_QUEUE_URL,
      MessageBody: JSON.stringify(event),
      MessageAttributes: {
        event_name: {
          DataType: 'String',
          StringValue: event.event_name,
        },
        account_id: {
          DataType: 'String',
          StringValue: event.account_id || 'unknown',
        },
      },
    });

    await sqsClient.send(command);
  } else {
    // Development mode: just log the event
    console.log('📨 Event queued (dev mode):', {
      event_id: event.event_id,
      event_name: event.event_name,
      account_id: event.account_id,
      timestamp: event.timestamp,
    });
    
    // In a real dev environment, you might write to a local file or in-memory queue
    // For now, we'll just log it
  }
}


