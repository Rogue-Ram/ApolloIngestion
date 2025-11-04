# Apollo - Project Summary



```
ApolloBE/
├── src/
│   ├── config/
│   │   └── index.ts              # Environment config with validation
│   ├── plugins/
│   │   └── auth.ts               # API key authentication plugin
│   ├── routes/
│   │   ├── events.ts             # Event ingestion endpoints
│   │   └── health.ts             # Health check endpoint
│   ├── services/
│   │   └── queue.ts              # SQS queue service
│   └── server.ts                 # Main Fastify server
│
│
├── docs/
│   ├── README.md                 # Main documentation
│   ├── QUICKSTART.md             # 5-minute getting started guide
│   ├── INTEGRATION.md            # C# backend integration guide
│   ├── API_EXAMPLES.md           # Multi-language API examples
│   └── CHANGELOG.md              # Version history
│
├── config/
│   ├── .env (create from env.example)
│   ├── env.example               # Environment template
│   ├── tsconfig.json             # TypeScript config
│   ├── .eslintrc.json            # ESLint config
│   ├── .gitignore                # Git ignore rules
│   └── .dockerignore             # Docker ignore rules
│
├── docker/
│   ├── Dockerfile                # Production Docker image
│   └── docker-compose.yml        # Docker Compose config
│
└── package.json                  # Node.js dependencies
```


1. **Event Ingestion API**
   - Single event endpoint: `POST /api/v1/events`
   - Batch endpoint: `POST /api/v1/events/batch` (up to 1000 events)
   - Schema documentation: `GET /api/v1/events/schema`
   - Flexible validation (only `event_name` required)

2. **Authentication**
   - API key via `X-API-Key` header
   - Bearer token support: `Authorization: Bearer <key>`
   - Multiple API keys support

3. **Event Processing**
   - Auto-enrichment (event_id, timestamp, received_at)
   - SQS integration (production)
   - Console logging (development)

4. **Developer Experience**
   - TypeScript with full type safety
   - Hot reload with `npm run dev`
   - Pretty logs in development
   - Health check endpoint
   - CORS enabled

5. **Deployment**
   - Docker support (multi-stage build)
   - Docker Compose config
   - Production-ready error handling
   - Graceful shutdown

6. **Documentation**
   - Complete README
   - Quick start guide
   - C# integration guide
   - Multi-language API examples
   - Test scripts

### (Not Implemented Yet)

1. **Event Processor**
   - SQS consumer
   - Batch writer to ClickHouse
   - Rules engine (sampling, transforms)
   - Geo/UA enrichment

2. **Query API**
   - Read analytics data
   - Caching with Redis
   - CloudFront CDN integration

3. **Real-time Updates**
   - WebSocket support
   - Redis Pub/Sub
   - Live dashboard updates

4. **ClickHouse Integration**
   - Database schema
   - Materialized views
   - Data retention policies

5. **Client SDK**
   - JavaScript SDK for browser
   - Auto-capture page views, clicks

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp env.example .env
# Edit .env and set API_KEYS

# 3. Run development server
npm run dev

# 4. Test it
curl http://localhost:3000/health
```

##  API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` |  No | Health check |
| POST | `/api/v1/events` |  Yes | Single event ingestion |
| POST | `/api/v1/events/batch` |  Yes | Batch event ingestion (max 1000) |
| GET | `/api/v1/events/schema` | Yes | Event schema documentation |

##  Authentication

All endpoints except `/health` require API key:

```bash
# Via header
curl -H "X-API-Key: your-key-here" http://localhost:3000/api/v1/events

# Via Bearer token
curl -H "Authorization: Bearer your-key-here" http://localhost:3000/api/v1/events
```

## 📝 Event Structure

### Required Fields
- `event_name` (string)

### Recommended Fields
- `account_id` (string)
- `timestamp` (ISO 8601 string)

### Optional Fields
- Any other fields you want

### Auto-Added Fields
- `event_id` (UUID)
- `received_at` (ISO 8601)
- `source` (string, defaults to "backend")
- `api_key` (which key was used)

## 🔧 Technology Stack

| Category | Technology | Why |
|----------|-----------|-----|
| **Runtime** | Node.js 20 | Modern, fast, async I/O |
| **Framework** | Fastify | 2-3x faster than Express |
| **Language** | TypeScript | Type safety, better DX |
| **Queue** | AWS SQS | Reliable, scalable, managed |
| **Config** | Zod | Runtime validation |
| **Logging** | Pino | Fast JSON logging |
| **Container** | Docker | Portable deployment |

## 💰 Cost Estimate (Production)

### At 100K events/day:

| Service | Cost/Month | Notes |
|---------|-----------|-------|
| ECS Fargate | ~$30 | 0.25 vCPU, 0.5 GB RAM, 24/7 |
| SQS | ~$1 | 3M requests |
| Data Transfer | ~$5 | Outbound traffic |
| **Total** | **~$36/mo** | Scales up from here |

## Common Commands

```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start            # Run production build

# Testing
./test-api.sh        # Test API (Unix)
./test-api.ps1       # Test API (Windows)

# Docker
docker-compose up apollo-backend    # Run production
docker-compose --profile dev up     # Run development

# Code Quality
npm run lint         # Lint TypeScript
```

## Documentation Files

1. **README.md** - Main documentation, complete API reference
2. **QUICKSTART.md** - Get up and running in 5 minutes
3. **INTEGRATION.md** - Integrate with your C# backend
4. **API_EXAMPLES.md** - Examples in C#, JavaScript, Python, etc.
5. **CHANGELOG.md** - Version history and roadmap
6. **PROJECT_SUMMARY.md** - This file!

## Learning Path

### For Backend Integration
1. Read **QUICKSTART.md** to get server running
2. Follow **INTEGRATION.md** to integrate C# backend
3. Use **API_EXAMPLES.md** for language-specific code

### For Development
1. Review **README.md** for architecture
2. Explore `src/` to understand code structure
3. Run tests with `./test-api.sh`

### For Deployment
1. Review **Dockerfile** for container build
2. Check **docker-compose.yml** for orchestration
3. Set environment variables for production




