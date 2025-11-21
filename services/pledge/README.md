# Pledge Service

A Spring Boot microservice for managing recurring pledges with event-driven architecture.

## Features

- **REST API Endpoints**:
  - `POST /pledges/recurring` - Create recurring pledge
  - `GET /pledges/{id}` - Get pledge details
  - `GET /pledges/history/{userId}` - Get user pledge history
  - `PUT /pledges/{id}/cancel` - Cancel pledge

- **Event-Driven Architecture**:
  - Transactional outbox pattern with MongoDB
  - Redis/BullMQ integration for event publishing
  - Automatic event publishing worker

- **Recurring Payment Scheduling**:
  - Daily cron job for due payment detection
  - Automatic payment enqueuing
  - Failure handling with retry logic

- **Observability**:
  - Prometheus metrics via `/actuator/prometheus`
  - Health checks via `/actuator/health`
  - Structured logging

## Quick Start

### Prerequisites
- Java 17+
- Docker & Docker Compose

### Local Development

1. **Start infrastructure**:
   ```bash
   docker-compose up mongodb redis
   ```

2. **Run the application**:
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Build and run with Docker**:
   ```bash
   ./mvnw clean package
   docker-compose up --build
   ```

### API Usage

**Create a recurring pledge**:
```bash
curl -X POST http://localhost:8080/pledges/recurring \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "campaignId": "campaign456",
    "amount": 50.00,
    "currency": "BDT",
    "interval": "MONTHLY",
    "startDate": "2025-01-01T00:00:00Z",
    "paymentMethod": {"reference": "pm_abc123"}
  }'
```

**Get pledge history**:
```bash
curl http://localhost:8080/pledges/history/user123
```

**Cancel a pledge**:
```bash
curl -X PUT http://localhost:8080/pledges/{pledgeId}/cancel
```

## Architecture

- **MongoDB**: Primary data store (pledges + outbox collections)
- **Redis**: Event bus for BullMQ integration
- **Outbox Pattern**: Ensures reliable event publishing
- **Scheduler**: Daily cron for recurring payment processing
- **Webhook Handler**: Processes payment service callbacks

## Monitoring

- Metrics: `http://localhost:8080/actuator/prometheus`
- Health: `http://localhost:8080/actuator/health`
- Application logs include structured JSON for Elasticsearch ingestion

## Event Types

- `PLEDGE_CREATED`
- `PLEDGE_PAYMENT_DUE`
- `PLEDGE_PAYMENT_SUCCESS`
- `PLEDGE_PAYMENT_FAILED`
- `PLEDGE_CANCELLED`
- `NOTIFICATION_REQUIRED`

Events are published to Redis queues for consumption by other services.