const RateLimit = require('../models/rateLimit.model');

const createRateLimit = ({ windowMs, max, message }, rateLimitStore = RateLimit) => {
  return async (req, res, next) => {
    const now = Date.now();
    const key = `auth:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    const resetAt = new Date(now + windowMs);

    try {
      let entry = await rateLimitStore.findOneAndUpdate(
        { key, resetAt: { $gt: new Date(now) } },
        { $inc: { count: 1 } },
        { new: true }
      );

      if (!entry) {
        try {
          entry = await rateLimitStore.findOneAndUpdate(
            { key },
            { $set: { count: 1, resetAt } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );
        } catch (error) {
          // Another instance may have created the first window concurrently.
          if (error.code !== 11000) throw error;
          entry = await rateLimitStore.findOneAndUpdate(
            { key, resetAt: { $gt: new Date() } },
            { $inc: { count: 1 } },
            { new: true }
          );
          if (!entry) throw error;
        }
      }

      res.set('RateLimit-Limit', String(max));
      res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));

      if (entry.count > max) {
        res.set('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt.getTime() - now) / 1000))));
        return res.status(429).json({ error: message });
      }
      return next();
    } catch (error) {
      console.error('Authentication rate limiter failed:', error);
      return res.status(503).json({ error: 'Authentication service temporarily unavailable' });
    }
  };
};

module.exports = createRateLimit;
