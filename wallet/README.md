# Mock Wallet Payment Gateway

A production-like mock payment gateway service built with Node.js, Express, and MongoDB. This service simulates a wallet-based payment system (similar to bKash, Nagad, or Rocket) for local development and testing without external payment provider dependencies.

## 🌟 Features

- **Payment Sessions**: Create payment links with expiry times
- **Wallet Authentication**: Phone + PIN based authentication
- **Atomic Transactions**: MongoDB transactions ensure balance consistency
- **Idempotency**: Prevents double-debit on form resubmission
- **Callback System**: Automatic retry with exponential backoff
- **Transaction History**: Complete audit trail of all operations
- **EJS Views**: User-friendly payment forms
- **Rate Limiting**: Protection against abuse
- **Comprehensive Logging**: Winston-based logging system

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- MongoDB 7.0+ (for local development)

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone and navigate to the wallet directory
cd wallet

# Start services
docker-compose up --build

# In another terminal, seed test users
docker-compose exec wallet npm run seed
```

The service will be available at `http://localhost:4000`

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start MongoDB (if not using Docker)
# mongod --dbpath /path/to/data

# Seed test users
npm run seed

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=4000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://mongo:27017/mock_wallet

# Payment Service Callback
PAYMENT_SERVICE_URL=http://payment-service:3002

# Transaction
TRANSACTION_EXPIRY_HOURS=1

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=*

# Callback Retry
MAX_CALLBACK_RETRIES=3
CALLBACK_RETRY_DELAY=1000
```

## 📚 API Documentation

### Base URL
```
http://localhost:4000
```

### 1. Create Payment Session

**Endpoint**: `POST /wallet/pay`

**Description**: Creates a new payment session (called by Payment Service)

**Request Body**:
```json
{
  "amount": 500,
  "metadata": {
    "order_id": "ORDER123",
    "campaign_id": "CAMP456"
  }
}
```

**Response** (201):
```json
{
  "transaction_id": "TXN_1234567890abcdef",
  "pay_url": "http://localhost:4000/wallet/pay/TXN_1234567890abcdef",
  "expires_at": "2024-01-01T13:00:00.000Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:4000/wallet/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 500, "metadata": {"order_id": "ORDER123"}}'
```

---

### 2. Show Payment Page

**Endpoint**: `GET /wallet/pay/:transaction_id`

**Description**: Renders payment form for users

**Response**: HTML page with payment form

**Browser URL**:
```
http://localhost:4000/wallet/pay/TXN_1234567890abcdef
```

---

### 3. Process Payment

**Endpoint**: `POST /wallet/pay/:transaction_id`

**Description**: Process payment submission from form

**Request Body** (form-encoded):
```
phone=01700000001&pin=1234
```

**Response**: HTML success/failure page

**cURL Example**:
```bash
curl -X POST http://localhost:4000/wallet/pay/TXN_1234567890abcdef \
  -d "phone=01700000001&pin=1234"
```

---

### 4. Create User

**Endpoint**: `POST /api/users`

**Description**: Register a new wallet user

**Request Body**:
```json
{
  "phone": "01700000001",
  "pin": "1234",
  "name": "John Doe",
  "balance": 1000
}
```

**Validation**:
- Phone: Must match `01[0-9]{9}` (Bangladesh format)
- PIN: Must be 4-6 digits
- Balance: Optional, defaults to 0

**Response** (201):
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "phone": "01700000001",
  "name": "John Doe",
  "balance": 1000,
  "isActive": true
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01700000001",
    "pin": "1234",
    "name": "John Doe",
    "balance": 1000
  }'
```

---

### 5. Login

**Endpoint**: `POST /api/auth/login`

**Description**: Authenticate user and get session token

**Request Body**:
```json
{
  "phone": "01700000001",
  "pin": "1234"
}
```

**Response** (200):
```json
{
  "token": "a1b2c3d4e5f6...",
  "userId": "507f1f77bcf86cd799439011",
  "expiresAt": "2024-01-02T12:00:00.000Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "01700000001", "pin": "1234"}'
```

---

### 6. Topup Wallet

**Endpoint**: `POST /wallet/topup`

**Description**: Add funds to wallet (for testing)

**Request Body**:
```json
{
  "phone": "01700000001",
  "amount": 500
}
```

**Response** (200):
```json
{
  "balance": 1500,
  "transactionId": "TXN_topup_1234567890",
  "amount": 500
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:4000/wallet/topup \
  -H "Content-Type: application/json" \
  -d '{"phone": "01700000001", "amount": 500}'
```

---

### 7. Get Transaction

**Endpoint**: `GET /api/transactions/:transaction_id`

**Description**: Retrieve transaction details

**Response** (200):
```json
{
  "transaction": {
    "transaction_id": "TXN_1234567890abcdef",
    "type": "PAYMENT",
    "amount": 500,
    "status": "SUCCESS",
    "balanceBefore": 1000,
    "balanceAfter": 500,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "user": {
      "phone": "01700000001",
      "name": "John Doe"
    }
  },
  "paySession": {
    "status": "SUCCESS",
    "callbackSuccess": true,
    "wallet_tx_ref": "WTX_abcdef123456"
  }
}
```

**cURL Example**:
```bash
curl http://localhost:4000/api/transactions/TXN_1234567890abcdef
```

---

### 8. Get User Transactions

**Endpoint**: `GET /api/users/:userId/transactions`

**Description**: Get transaction history for a user

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type (PAYMENT or TOPUP)
- `status` (optional): Filter by status (SUCCESS or FAILED)

**Response** (200):
```json
{
  "transactions": [
    {
      "transaction_id": "TXN_123",
      "type": "PAYMENT",
      "amount": 500,
      "status": "SUCCESS",
      "balanceBefore": 1000,
      "balanceAfter": 500,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**cURL Example**:
```bash
curl "http://localhost:4000/api/users/507f1f77bcf86cd799439011/transactions?page=1&limit=10&type=PAYMENT"
```

---

### 9. Health Check

**Endpoint**: `GET /health`

**Response** (200):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600
}
```

## 🧪 Testing Workflow

### 1. Seed Test Users

```bash
npm run seed
```

This creates 5 test users:

| Phone         | PIN  | Balance  | Description       |
|---------------|------|----------|-------------------|
| 01700000001   | 1234 | ৳1,000   | Test User 1       |
| 01700000002   | 5678 | ৳2,000   | Test User 2       |
| 01700000003   | 9999 | ৳500     | Test User 3       |
| 01800000001   | 1111 | ৳10,000  | Premium User      |
| 01900000001   | 0000 | ৳10      | Low Balance User  |

### 2. Simulate Payment Flow

```bash
# Step 1: Create payment session (Payment Service calls this)
curl -X POST http://localhost:4000/wallet/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "metadata": {"order_id": "TEST123"}}'

# Response: {"transaction_id": "TXN_xyz...", "pay_url": "http://..."}

# Step 2: Open payment URL in browser
# Visit: http://localhost:4000/wallet/pay/TXN_xyz...

# Step 3: Fill form with phone and PIN
# Phone: 01700000001
# PIN: 1234

# Step 4: Submit form - payment processed atomically

# Step 5: Wallet Gateway calls back to Payment Service
# POST http://payment-service:3002/payment/success/TXN_xyz...
```

### 3. Test Scenarios

#### Successful Payment
```bash
# User with sufficient balance
curl -X POST http://localhost:4000/wallet/pay/TXN_xyz... \
  -d "phone=01700000001&pin=1234"
```

#### Insufficient Balance
```bash
# Try to pay ৳5000 with user who has ৳10
curl -X POST http://localhost:4000/wallet/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000}'

# Then use phone=01900000001&pin=0000
```

#### Invalid PIN
```bash
curl -X POST http://localhost:4000/wallet/pay/TXN_xyz... \
  -d "phone=01700000001&pin=9999"  # Wrong PIN
```

#### Idempotency (Double Submission)
```bash
# Submit same payment twice - second attempt returns success without re-processing
curl -X POST http://localhost:4000/wallet/pay/TXN_xyz... \
  -d "phone=01700000001&pin=1234"

curl -X POST http://localhost:4000/wallet/pay/TXN_xyz... \
  -d "phone=01700000001&pin=1234"  # Returns success, no double-debit
```

#### Transaction Expiry
```bash
# Wait 1 hour (or change TRANSACTION_EXPIRY_HOURS to 0.01 for 36 seconds)
# Then try to pay - will show "Transaction Expired"
```

## 🏗️ Architecture

### Payment Flow

```
Payment Service                Mock Wallet Gateway                 User
      |                               |                              |
      |  POST /wallet/pay             |                              |
      |------------------------------>|                              |
      |                               |                              |
      |  {transaction_id, pay_url}    |                              |
      |<------------------------------|                              |
      |                               |                              |
      |    Redirect user to pay_url   |                              |
      |------------------------------------------------------>|      |
      |                               |                              |
      |                               |  GET /wallet/pay/:id         |
      |                               |<-----------------------------|
      |                               |                              |
      |                               |  Render payment form         |
      |                               |----------------------------->|
      |                               |                              |
      |                               |  POST /wallet/pay/:id        |
      |                               |  {phone, pin}                |
      |                               |<-----------------------------|
      |                               |                              |
      |                               | [Authenticate]               |
      |                               | [Check balance]              |
      |                               | [Atomic deduction]           |
      |                               | [Create transaction]         |
      |                               |                              |
      |                               |  Success page                |
      |                               |----------------------------->|
      |                               |                              |
      |  POST /payment/success/:id    |                              |
      |  {status, wallet_tx_ref, ...} |                              |
      |<------------------------------|                              |
      |                               |                              |
```

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  phone: String (unique, indexed),
  pinHash: String,
  name: String,
  balance: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Sessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  token: String (unique, indexed),
  expiresAt: Date (TTL index),
  createdAt: Date
}
```

#### Transactions Collection
```javascript
{
  _id: ObjectId,
  transaction_id: String (unique, indexed),
  userId: ObjectId (ref: User, indexed),
  type: Enum ['PAYMENT', 'TOPUP'],
  amount: Number,
  status: Enum ['SUCCESS', 'FAILED'],
  reference: String,
  balanceBefore: Number,
  balanceAfter: Number,
  createdAt: Date (indexed)
}
```

#### PaySessions Collection
```javascript
{
  _id: ObjectId,
  transaction_id: String (unique, indexed),
  amount: Number,
  status: Enum ['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'],
  callback_url: String,
  expiresAt: Date (TTL index),
  wallet_tx_ref: String,
  callbackAttempts: Number,
  callbackSuccess: Boolean,
  callbackLastAttempt: Date,
  failureReason: String,
  meta: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **PIN Hashing**: bcrypt with 10 rounds
- **Rate Limiting**: 
  - General API: 100 req/15min
  - Auth endpoints: 10 req/15min
  - Payment endpoints: 20 req/15min
- **Helmet**: Security headers (CSP, XSS protection)
- **CORS**: Configurable origin whitelist
- **Input Validation**: Mongoose schemas + controller validation
- **SQL Injection Protection**: MongoDB (NoSQL) + parameterized queries
- **Session Expiry**: 24-hour token lifetime with TTL index

## 📊 Monitoring

### Logs

Logs are written to:
- Console (development)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)

### Health Endpoint

```bash
curl http://localhost:4000/health
```

### Metrics (Future Enhancement)

Integration points for Prometheus metrics:
- Payment success rate
- Average payment processing time
- Callback retry rate
- Balance distribution

## 🧹 Maintenance

### Clear Old Sessions

Sessions automatically expire via MongoDB TTL index on `expiresAt` field.

### Clear Old Transactions

```javascript
// Run periodically
db.paysessions.find({ expiresAt: { $lt: new Date() }, status: 'PENDING' }).forEach(doc => {
  db.paysessions.updateOne(
    { _id: doc._id },
    { $set: { status: 'EXPIRED' } }
  );
});
```

### Retry Failed Callbacks

```javascript
// Background job (future enhancement)
const { retryFailedCallbacks } = require('./src/services/callback.service');
setInterval(retryFailedCallbacks, 5 * 60 * 1000); // Every 5 minutes
```

## 🛠️ Development

### Scripts

```bash
npm run dev        # Start with nodemon
npm start          # Start production server
npm run seed       # Seed test users
npm test           # Run Jest tests (future)
npm run lint       # Run ESLint (future)
```

### Project Structure

```
wallet/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── views/           # EJS templates
│   ├── app.js           # Express app
│   └── server.js        # Entry point
├── scripts/
│   ├── seed.js          # Test data seeder
│   └── mongo-init.js    # MongoDB init
├── logs/                # Log files
├── .env.example         # Environment template
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 🔄 Integration with Payment Service

### Payment Service Code Example

```javascript
// In your Payment Service

async function initiateWalletPayment(amount, orderId) {
  const response = await axios.post('http://localhost:4000/wallet/pay', {
    amount,
    metadata: {
      order_id: orderId,
      campaign_id: 'CAMP123',
    },
  });

  const { transaction_id, pay_url, expires_at } = response.data;

  // Save transaction_id to your database
  await Payment.create({
    orderId,
    transaction_id,
    amount,
    status: 'PENDING',
    gateway: 'MOCK_WALLET',
    expiresAt: expires_at,
  });

  // Redirect user to pay_url
  return pay_url;
}

// Callback endpoint in Payment Service
app.post('/payment/success/:transaction_id', async (req, res) => {
  const { transaction_id } = req.params;
  const { status, wallet_tx_ref, amount, new_balance, timestamp, signature } = req.body;

  // Verify signature (optional but recommended)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(JSON.stringify({ transaction_id, status, wallet_tx_ref, amount, timestamp }))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Update payment status
  await Payment.updateOne(
    { transaction_id },
    {
      status: status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
      wallet_tx_ref,
      completedAt: new Date(),
    }
  );

  res.json({ received: true });
});
```

## 📝 License

MIT

## 👥 Contributing

This is a mock service for development purposes. Contributions welcome!

## ⚠️ Disclaimer

**This is a mock payment gateway for development and testing only. Do not use in production with real money.**

For production, integrate with real payment gateways:
- **Bangladesh**: bKash, Nagad, Rocket, SSL Commerz, AmarPay
- **International**: Stripe, PayPal, Braintree

## 🆘 Support

For issues or questions:
1. Check logs: `docker-compose logs wallet`
2. Verify MongoDB connection: `docker-compose exec mongo mongosh mock_wallet`
3. Check health endpoint: `curl http://localhost:4000/health`

---

**Made with ❤️ for CareForAll Donation Platform**
