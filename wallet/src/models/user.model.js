/**
 * User Model
 * Represents wallet users with phone, PIN, and balance
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
    match: /^01[0-9]{9}$/, // Bangladesh phone format
  },
  pinHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
userSchema.index({ phone: 1 });

// Instance method to check if user has sufficient balance
userSchema.methods.hasSufficientBalance = function(amount) {
  return this.balance >= amount;
};

// Instance method to get safe user data (without PIN)
userSchema.methods.toSafeObject = function() {
  return {
    userId: this._id,
    phone: this.phone,
    name: this.name,
    balance: this.balance,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
