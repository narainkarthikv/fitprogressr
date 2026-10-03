const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
    resetAt: { type: Date, required: true, expires: 0 },
  },
  { collection: 'rate_limits', versionKey: false }
);

module.exports = mongoose.model('RateLimit', rateLimitSchema);
