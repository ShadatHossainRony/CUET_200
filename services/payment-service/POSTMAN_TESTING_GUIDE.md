# Payment Service - Postman Testing Guide

## Architecture Overview

This payment service uses **BullMQ** for async job processing and implements professional webhook callbacks:

- **Async Processing**: Payments are queued and processed asynchronously
- **Webhook Support**: Automatic webhook delivery on success/failure
- **Retry Logic**: Automatic retries for failed payments and webhooks
- **Status Tracking**: Real-time transaction status updates

## Prerequisites

1. **Start MongoDB and Redis** (if not already running):
   ```bash
   # From project root
   docker-compose up -d mongodb redis
   ```

2. **Install Dependencies**:
   ```bash
   cd services/payment-service
   npm install
   ```

3. **Create `.env` file** (if not exists):
   ```env
   PORT=3004
   MONGO_URI=mongodb://root:root@localhost:27017/payment_db?authSource=admin
   REDIS_URL=redis://localhost:6379
   WEBHOOK_SECRET=your-webhook-secret-key
   ```

4. **Start the Payment Service**:
   ```bash
   npm start
   # Service will run on http://localhost:3004
   # Workers will automatically start processing jobs
   ```

## Postman Testing

### 1. Health Check Endpoint

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3004/health`
- **Headers:** None required

**Expected Response (200 OK):**
```json
{
  "status": "ok",
  "service": "payment-service"
}
```

---

### 2. Process Payment - With Webhook (Always Succeeds)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/payment/process`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "campaignId": "campaign_123",
  "amount": 50.00,
  "currency": "USD",
  "paymentMethod": {
    "cardNumber": "4242424242424242"
  },
  "webhookUrl": "https://webhook.site/your-unique-url",
  "metadata": {
    "pledgeId": "pledge_456",
    "userId": "user_789",
    "type": "donation"
  }
}
```

**Expected Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Payment request accepted and queued for processing",
  "transactionId": "txn_xxxxx_xxxxxx",
  "status": "pending",
  "amount": 50.00,
  "currency": "USD"
}
```

**Note:** The payment is processed asynchronously. Use the `transactionId` to check status.

---

### 3. Process Payment - Without Webhook

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/payment/process`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "campaignId": "campaign_123",
  "amount": 25.00,
  "currency": "USD",
  "paymentMethod": {
    "cardNumber": "4242424242424242"
  },
  "metadata": {
    "pledgeId": "pledge_456",
    "userId": "user_789"
  }
}
```

**Expected Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Payment request accepted and queued for processing",
  "transactionId": "txn_xxxxx_xxxxxx",
  "status": "pending",
  "amount": 25.00,
  "currency": "USD"
}
```

---

### 4. Get Transaction Status

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:3004/payment/status/{transactionId}`
- **Headers:** None required

**Example URL:** `http://localhost:3004/payment/status/txn_xxxxx_xxxxxx`

**Expected Response (200 OK) - Completed:**
```json
{
  "success": true,
  "transaction": {
    "transactionId": "txn_xxxxx_xxxxxx",
    "campaignId": "campaign_123",
    "amount": 50.00,
    "currency": "USD",
    "status": "completed",
    "paymentMethod": {
      "last4": "4242",
      "brand": "Visa"
    },
    "failureReason": null,
    "metadata": {
      "pledgeId": "pledge_456",
      "userId": "user_789",
      "type": "donation"
    },
    "webhook": {
      "delivered": true,
      "deliveredAt": "2024-01-15T10:30:00.000Z",
      "attempts": 1
    },
    "createdAt": "2024-01-15T10:29:55.000Z",
    "processedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Expected Response (200 OK) - Failed:**
```json
{
  "success": true,
  "transaction": {
    "transactionId": "txn_xxxxx_xxxxxx",
    "campaignId": "campaign_123",
    "amount": 25.00,
    "currency": "USD",
    "status": "failed",
    "paymentMethod": {
      "last4": "0002",
      "brand": "Visa"
    },
    "failureReason": "Card declined by issuer",
    "metadata": {},
    "webhook": {
      "delivered": true,
      "deliveredAt": "2024-01-15T10:30:00.000Z",
      "attempts": 1
    },
    "createdAt": "2024-01-15T10:29:55.000Z",
    "processedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Expected Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Transaction not found"
}
```

---

### 5. Process Payment - Failure (Card Declined)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/payment/process`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "campaignId": "campaign_123",
  "amount": 25.00,
  "currency": "USD",
  "paymentMethod": {
    "cardNumber": "4000000000000002"
  },
  "webhookUrl": "https://webhook.site/your-unique-url",
  "metadata": {
    "pledgeId": "pledge_456",
    "userId": "user_789"
  }
}
```

**Expected Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Payment request accepted and queued for processing",
  "transactionId": "txn_xxxxx_xxxxxx",
  "status": "pending",
  "amount": 25.00,
  "currency": "USD"
}
```

**Note:** Check status after a few seconds - it will be `failed` with `failureReason: "Card declined by issuer"`

---

### 6. Process Payment - Invalid Card Number

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/payment/process`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "campaignId": "campaign_123",
  "amount": 50.00,
  "currency": "USD",
  "paymentMethod": {
    "cardNumber": "1234567890123456"
  }
}
```

**Expected Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Payment request accepted and queued for processing",
  "transactionId": "txn_xxxxx_xxxxxx",
  "status": "pending",
  "amount": 50.00,
  "currency": "USD"
}
```

**Note:** Check status - it will be `failed` with `failureReason: "Invalid card number"`

---

### 7. Process Payment - Missing Required Fields

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/payment/process`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "campaignId": "campaign_123",
  "amount": 50.00
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: campaignId, amount, and paymentMethod.cardNumber are required"
}
```

---

### 8. Receive Webhook (External Gateway Callback)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:3004/webhook`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "transactionId": "txn_xxxxx_xxxxxx",
  "status": "completed",
  "gatewayResponse": {
    "code": "SUCCESS",
    "message": "Payment processed successfully",
    "authorizationCode": "AUTH_ABC123"
  }
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Webhook received and processed",
  "transactionId": "txn_xxxxx_xxxxxx"
}
```

---

## Webhook Testing

### Testing Webhook Delivery

1. **Get a webhook URL** from [webhook.site](https://webhook.site) or use your own endpoint
2. **Include `webhookUrl`** in your payment request
3. **Process a payment** (success or failure)
4. **Check the webhook URL** - you should receive a POST request with:

**Success Webhook Payload:**
```json
{
  "event": "payment.completed",
  "transactionId": "txn_xxxxx_xxxxxx",
  "campaignId": "campaign_123",
  "amount": 50.00,
  "currency": "USD",
  "status": "completed",
  "paymentMethod": {
    "last4": "4242",
    "brand": "Visa"
  },
  "failureReason": null,
  "metadata": {
    "pledgeId": "pledge_456",
    "userId": "user_789",
    "type": "donation"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Failure Webhook Payload:**
```json
{
  "event": "payment.failed",
  "transactionId": "txn_xxxxx_xxxxxx",
  "campaignId": "campaign_123",
  "amount": 25.00,
  "currency": "USD",
  "status": "failed",
  "paymentMethod": {
    "last4": "0002",
    "brand": "Visa"
  },
  "failureReason": "Card declined by issuer",
  "metadata": {},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Webhook Headers:**
- `Content-Type: application/json`
- `X-Payment-Signature: <HMAC-SHA256-signature>`
- `User-Agent: Payment-Service/1.0`

---

## Mock Payment Gateway Rules

The payment gateway uses the following mock logic:

1. **Card `4242424242424242`** → Always succeeds ✅
2. **Card `4000000000000002`** → Always fails (Card declined) ❌
3. **Card `4000000000009995`** → Always fails (Insufficient funds) ❌
4. **Any other valid card** → 90% success probability (random)
5. **Invalid card numbers** → Always fails (Invalid card number)

## Card Number Examples by Brand

- **Visa:** `4242424242424242` (always succeeds), `4000000000000002` (declined), `4000000000009995` (insufficient funds)
- **Mastercard:** `5555555555554444` (random outcome)
- **Amex:** `378282246310005` (random outcome)
- **Discover:** `6011111111111117` (random outcome)

## Testing Workflow

1. **Submit Payment** → Get `transactionId` with status `pending`
2. **Wait 1-2 seconds** → Payment is processed asynchronously
3. **Check Status** → Use GET endpoint to see final status
4. **Verify Webhook** → Check your webhook URL for callback (if provided)

## Testing Checklist

- [ ] Health check endpoint works
- [ ] Payment request returns 202 with pending status
- [ ] Transaction status endpoint works
- [ ] Payment with card `4242424242424242` succeeds
- [ ] Payment with card `4000000000000002` fails
- [ ] Payment with invalid card fails
- [ ] Webhook is delivered on success (if webhookUrl provided)
- [ ] Webhook is delivered on failure (if webhookUrl provided)
- [ ] Missing required fields returns 400 error
- [ ] Transaction is saved to MongoDB with correct status

## Verify Transactions in MongoDB

```bash
# Connect to MongoDB
mongosh mongodb://root:root@localhost:27017/payment_db?authSource=admin

# View all transactions
db.transactions.find().pretty()

# View pending transactions
db.transactions.find({ status: "pending" }).pretty()

# View completed transactions
db.transactions.find({ status: "completed" }).pretty()

# View failed transactions
db.transactions.find({ status: "failed" }).pretty()

# View transactions with webhook delivery status
db.transactions.find({ "webhook.delivered": true }).pretty()
```

## Architecture Notes

- **Async Processing**: Payments are queued using BullMQ and processed by workers
- **Retry Logic**: Failed payments and webhooks are automatically retried (3 attempts for payments, 5 for webhooks)
- **Webhook Delivery**: Webhooks are delivered asynchronously with exponential backoff
- **Status Tracking**: Transaction status updates from `pending` → `processing` → `completed`/`failed`
- **Scalability**: Workers can process multiple payments concurrently (5 concurrent payments, 10 concurrent webhooks)
