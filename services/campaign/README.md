# Campaign Service

CRUD management for fundraising campaigns with event publishing to platform-wide consumers.

## Features

- Create, read, update campaigns
- MongoDB persistence with proper indexing
- Event publishing to Redis streams for BullMQ consumers
- JWT authentication via API Gateway
- Comprehensive validation and error handling
- Observability with metrics and tracing

## API Endpoints

- `POST /campaigns` - Create campaign
- `GET /campaigns` - List campaigns (with pagination, filters)
- `GET /campaigns/{id}` - Get campaign details
- `PUT /campaigns/{id}` - Update campaign

## Quick Start

### Local Development

```bash
# Start dependencies
docker-compose -f docker-compose.campaign.yml up mongodb redis

# Run application
mvn spring-boot:run
```

### Docker

```bash
# Build and run everything
docker-compose -f docker-compose.campaign.yml up --build
```

## Configuration

Key environment variables:

- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` - Redis host for event publishing
- `REDIS_PORT` - Redis port
- `SERVER_PORT` - Application port (default: 8080)

## Events Published

- `CAMPAIGN_CREATED` - When campaign is created
- `CAMPAIGN_UPDATED` - When campaign is updated

Events are published to Redis stream `platform-events` for BullMQ consumers.

## Health Check

```bash
curl http://localhost:8080/actuator/health
```