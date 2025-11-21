/**
 * Session Model
 * Manages user authentication sessions
 */

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Index for automatic cleanup of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to clean expired sessions
sessionSchema.statics.cleanExpired = async function() {
  const now = new Date();
  const result = await this.deleteMany({ expiresAt: { $lt: now } });
  return result.deletedCount;
};

// Instance method to check if session is valid
sessionSchema.methods.isValid = function() {
  return this.expiresAt > new Date();
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
