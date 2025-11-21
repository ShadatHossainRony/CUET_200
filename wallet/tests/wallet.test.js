/**
 * Wallet Controller Tests
 * Run: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const PaySession = require('../src/models/paySession.model');
const Transaction = require('../src/models/transaction.model');
const { hashPin } = require('../src/utils/hash');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mock_wallet_test';

beforeAll(async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await PaySession.deleteMany({});
  await Transaction.deleteMany({});
});

describe('Wallet Payment Flow', () => {
  let testUser;

  beforeEach(async () => {
    const pinHash = await hashPin('1234');
    testUser = await User.create({
      phone: '01700000001',
      pinHash,
      name: 'Test User',
      balance: 1000,
      isActive: true,
    });
  });

  describe('POST /wallet/pay - Create Payment Session', () => {
    it('should create a payment session with valid amount', async () => {
      const response = await request(app)
        .post('/wallet/pay')
        .send({ amount: 500 })
        .expect(201);

      expect(response.body).toHaveProperty('transaction_id');
      expect(response.body).toHaveProperty('pay_url');
      expect(response.body).toHaveProperty('expires_at');

      const paySession = await PaySession.findOne({ transaction_id: response.body.transaction_id });
      expect(paySession).toBeTruthy();
      expect(paySession.amount).toBe(500);
      expect(paySession.status).toBe('PENDING');
    });

    it('should reject invalid amount', async () => {
      await request(app)
        .post('/wallet/pay')
        .send({ amount: -100 })
        .expect(400);

      await request(app)
        .post('/wallet/pay')
        .send({ amount: 0 })
        .expect(400);
    });
  });

  describe('POST /wallet/pay/:transaction_id - Process Payment', () => {
    let paySession;

    beforeEach(async () => {
      const response = await request(app)
        .post('/wallet/pay')
        .send({ amount: 100 });

      paySession = await PaySession.findOne({ transaction_id: response.body.transaction_id });
    });

    it('should process payment with valid credentials', async () => {
      const response = await request(app)
        .post(`/wallet/pay/${paySession.transaction_id}`)
        .send({ phone: '01700000001', pin: '1234' })
        .expect(200);

      expect(response.text).toContain('Payment Successful');

      const updatedSession = await PaySession.findById(paySession._id);
      expect(updatedSession.status).toBe('SUCCESS');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.balance).toBe(900); // 1000 - 100

      const transaction = await Transaction.findOne({ transaction_id: paySession.transaction_id });
      expect(transaction).toBeTruthy();
      expect(transaction.type).toBe('PAYMENT');
      expect(transaction.amount).toBe(100);
      expect(transaction.balanceBefore).toBe(1000);
      expect(transaction.balanceAfter).toBe(900);
    });

    it('should reject invalid PIN', async () => {
      const response = await request(app)
        .post(`/wallet/pay/${paySession.transaction_id}`)
        .send({ phone: '01700000001', pin: '9999' })
        .expect(200);

      expect(response.text).toContain('Payment Failed');

      const updatedSession = await PaySession.findById(paySession._id);
      expect(updatedSession.status).toBe('FAILED');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.balance).toBe(1000); // No change
    });

    it('should reject insufficient balance', async () => {
      const largePayment = await request(app)
        .post('/wallet/pay')
        .send({ amount: 5000 });

      const session = await PaySession.findOne({ transaction_id: largePayment.body.transaction_id });

      const response = await request(app)
        .post(`/wallet/pay/${session.transaction_id}`)
        .send({ phone: '01700000001', pin: '1234' })
        .expect(200);

      expect(response.text).toContain('Insufficient balance');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.balance).toBe(1000); // No change
    });

    it('should prevent double payment (idempotency)', async () => {
      // First payment
      await request(app)
        .post(`/wallet/pay/${paySession.transaction_id}`)
        .send({ phone: '01700000001', pin: '1234' })
        .expect(200);

      // Second payment attempt
      const response = await request(app)
        .post(`/wallet/pay/${paySession.transaction_id}`)
        .send({ phone: '01700000001', pin: '1234' })
        .expect(200);

      expect(response.text).toContain('Payment Already Completed');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.balance).toBe(900); // Only deducted once

      const transactions = await Transaction.find({ transaction_id: paySession.transaction_id });
      expect(transactions).toHaveLength(1); // Only one transaction created
    });
  });

  describe('POST /wallet/topup - Topup Wallet', () => {
    it('should add funds to wallet', async () => {
      const response = await request(app)
        .post('/wallet/topup')
        .send({ phone: '01700000001', amount: 500 })
        .expect(200);

      expect(response.body.balance).toBe(1500); // 1000 + 500
      expect(response.body.amount).toBe(500);
      expect(response.body).toHaveProperty('transactionId');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.balance).toBe(1500);

      const transaction = await Transaction.findOne({ transaction_id: response.body.transactionId });
      expect(transaction.type).toBe('TOPUP');
    });

    it('should reject invalid amount', async () => {
      await request(app)
        .post('/wallet/topup')
        .send({ phone: '01700000001', amount: -100 })
        .expect(400);
    });

    it('should reject non-existent user', async () => {
      await request(app)
        .post('/wallet/topup')
        .send({ phone: '01999999999', amount: 500 })
        .expect(404);
    });
  });
});

describe('User Management', () => {
  describe('POST /api/users - Create User', () => {
    it('should create user with valid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          phone: '01700000001',
          pin: '1234',
          name: 'Test User',
          balance: 1000,
        })
        .expect(201);

      expect(response.body).toHaveProperty('userId');
      expect(response.body.phone).toBe('01700000001');
      expect(response.body.name).toBe('Test User');
      expect(response.body.balance).toBe(1000);
      expect(response.body).not.toHaveProperty('pinHash');
    });

    it('should reject invalid phone format', async () => {
      await request(app)
        .post('/api/users')
        .send({
          phone: '123456',
          pin: '1234',
        })
        .expect(400);
    });

    it('should reject invalid PIN format', async () => {
      await request(app)
        .post('/api/users')
        .send({
          phone: '01700000001',
          pin: '12', // Too short
        })
        .expect(400);

      await request(app)
        .post('/api/users')
        .send({
          phone: '01700000001',
          pin: '1234567', // Too long
        })
        .expect(400);
    });

    it('should reject duplicate phone', async () => {
      await request(app)
        .post('/api/users')
        .send({
          phone: '01700000001',
          pin: '1234',
        })
        .expect(201);

      await request(app)
        .post('/api/users')
        .send({
          phone: '01700000001',
          pin: '5678',
        })
        .expect(409);
    });
  });
});

describe('Authentication', () => {
  let testUser;

  beforeEach(async () => {
    const pinHash = await hashPin('1234');
    testUser = await User.create({
      phone: '01700000001',
      pinHash,
      name: 'Test User',
      balance: 1000,
      isActive: true,
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ phone: '01700000001', pin: '1234' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body.userId).toBe(testUser._id.toString());
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ phone: '01700000001', pin: '9999' })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ phone: '01999999999', pin: '1234' })
        .expect(401);
    });
  });
});

describe('Transaction Queries', () => {
  let testUser;
  let transaction;

  beforeEach(async () => {
    const pinHash = await hashPin('1234');
    testUser = await User.create({
      phone: '01700000001',
      pinHash,
      name: 'Test User',
      balance: 1000,
      isActive: true,
    });

    transaction = await Transaction.create({
      transaction_id: 'TXN_test123',
      userId: testUser._id,
      type: 'PAYMENT',
      amount: 100,
      status: 'SUCCESS',
      balanceBefore: 1000,
      balanceAfter: 900,
    });
  });

  describe('GET /api/transactions/:transaction_id', () => {
    it('should retrieve transaction by ID', async () => {
      const response = await request(app)
        .get('/api/transactions/TXN_test123')
        .expect(200);

      expect(response.body.transaction.transaction_id).toBe('TXN_test123');
      expect(response.body.transaction.amount).toBe(100);
      expect(response.body.transaction.user.phone).toBe('01700000001');
    });

    it('should return 404 for non-existent transaction', async () => {
      await request(app)
        .get('/api/transactions/TXN_invalid')
        .expect(404);
    });
  });

  describe('GET /api/users/:userId/transactions', () => {
    it('should retrieve user transaction history', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}/transactions`)
        .expect(200);

      expect(response.body.transactions).toHaveLength(1);
      expect(response.body.transactions[0].transaction_id).toBe('TXN_test123');
      expect(response.body.pagination.total).toBe(1);
    });

    it('should support pagination', async () => {
      // Create more transactions
      for (let i = 0; i < 25; i++) {
        await Transaction.create({
          transaction_id: `TXN_${i}`,
          userId: testUser._id,
          type: 'PAYMENT',
          amount: 10,
          status: 'SUCCESS',
          balanceBefore: 1000,
          balanceAfter: 990,
        });
      }

      const response = await request(app)
        .get(`/api/users/${testUser._id}/transactions?page=1&limit=10`)
        .expect(200);

      expect(response.body.transactions).toHaveLength(10);
      expect(response.body.pagination.pages).toBeGreaterThan(1);
    });
  });
});

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});
