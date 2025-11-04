# Apollo Analytics Backend



## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your API key(s):

```bash
API_KEYS=your-secure-api-key-here
```

Generate a secure API key:
```bash
openssl rand -hex 32
```

### 3. Run Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Usage

### Send a Single Event

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "X-API-Key: your-secure-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "order_created",
    "account_id": "account_123",
    "order_id": "ORD-456",
    "amount": 99.99,
    "currency": "USD"
  }'
```

### Send Batch Events

```bash
curl -X POST http://localhost:3000/api/v1/events/batch \
  -H "X-API-Key: your-secure-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "event_name": "order_created",
        "account_id": "account_123",
        "order_id": "ORD-456",
        "amount": 99.99
      },
      {
        "event_name": "payment_completed",
        "account_id": "account_123",
        "order_id": "ORD-456",
        "amount": 99.99
      }
    ]
  }'
```

### Check Health

```bash
curl http://localhost:3000/health
```

### Get Event Schema

```bash
curl http://localhost:3000/api/v1/events/schema \
  -H "X-API-Key: your-secure-api-key-here"
```

## Event Structure

### Required Fields
- `event_name` (string) - Name of the event

### Recommended Fields
- `account_id` (string) - Account identifier
- `timestamp` (ISO 8601 string) - When the event occurred

### Optional Fields
Add any fields you want! The system is flexible and accepts any JSON structure.

### Auto-Added Fields
- `event_id` (UUID) - Unique event identifier
- `received_at` (ISO 8601) - Server receipt timestamp
- `source` (string) - Event source (defaults to "backend")

## Development vs Production

### Development Mode (Default)
- Events logged to console
- No SQS required
- Fast iteration

### Production Mode
1. Set environment variables:
   ```bash
   NODE_ENV=production
   AWS_REGION=
   SQS_QUEUE_URL=
   ```

2. Events automatically sent to SQS
3. Event Processor reads from SQS and writes to ClickHouse

## API Reference

### POST /api/v1/events
Ingest a single event.

**Headers:**
- `X-API-Key` or `Authorization: Bearer <key>` (required)

**Body:**
```json
{
  "event_name": "string (required)",
  "account_id": "string (recommended)",
  "...": "any other fields"
}
```

**Response:** `202 Accepted`
```json
{
  "status": "accepted",
  "event_id": "uuid",
  "message": "Event queued for processing"
}
```

### POST /api/v1/events/batch
Ingest multiple events (max 1000).

**Headers:**
- `X-API-Key` or `Authorization: Bearer <key>` (required)

**Body:**
```json
{
  "events": [
    { "event_name": "event1", ... },
    { "event_name": "event2", ... }
  ]
}
```

**Response:** `202 Accepted`
```json
{
  "status": "accepted",
  "count": 2,
  "message": "Events queued for processing"
}
```

### GET /api/v1/events/schema
Get event schema and examples.

### GET /health
Health check endpoint (no auth required).

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint code




