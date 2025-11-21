/**
 * Seed Script - Create Test Users
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const { hashPin } = require('../src/utils/hash');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/wallet';

const testUsers = [
  {
    phone: '01700000001',
    pin: '1234',
    name: 'Test User 1',
    balance: 1000,
  },
  {
    phone: '01700000002',
    pin: '5678',
    name: 'Test User 2',
    balance: 2000,
  },
  {
    phone: '01700000003',
    pin: '9999',
    name: 'Test User 3',
    balance: 500,
  },
  {
    phone: '01800000001',
    pin: '1111',
    name: 'Premium User',
    balance: 10000,
  },
  {
    phone: '01900000001',
    pin: '0000',
    name: 'Low Balance User',
    balance: 10,
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing users
    console.log('Clearing existing users...');
    await User.deleteMany({});
    console.log('Users cleared');

    // Create test users
    console.log('Creating test users...');
    for (const userData of testUsers) {
      const pinHash = await hashPin(userData.pin);
      const user = new User({
        phone: userData.phone,
        pinHash,
        name: userData.name,
        balance: userData.balance,
        isActive: true,
      });
      await user.save();
      console.log(`Created user: ${userData.phone} (PIN: ${userData.pin}, Balance: ${userData.balance})`);
    }

    console.log('\n✓ Seed completed successfully!');
    console.log('\nTest Users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach(user => {
      console.log(`Phone: ${user.phone} | PIN: ${user.pin} | Balance: ৳${user.balance}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
