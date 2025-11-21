// MongoDB initialization script
// This script runs when the MongoDB container first starts

db = db.getSiblingDB('wallet');

// Create collections
db.createCollection('users');
db.createCollection('sessions');
db.createCollection('transactions');
db.createCollection('paysessions');

// Create indexes
db.users.createIndex({ phone: 1 }, { unique: true });
db.sessions.createIndex({ token: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.transactions.createIndex({ transaction_id: 1 }, { unique: true });
db.transactions.createIndex({ userId: 1, createdAt: -1 });
db.paysessions.createIndex({ transaction_id: 1 }, { unique: true });
db.paysessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('Wallet database initialized successfully');
