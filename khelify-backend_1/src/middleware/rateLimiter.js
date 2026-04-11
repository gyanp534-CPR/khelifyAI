const rateLimit = require('express-rate-limit');

// General API limiter — prevents abuse from any single IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down' },
});

// Strict limiter for expensive endpoints
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many requests to this endpoint' },
});

// Refresh endpoint — only cron-job.org should call this
const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3, // max 3 refresh calls per minute
  message: { error: 'Refresh rate limited' },
});

module.exports = { generalLimiter, strictLimiter, refreshLimiter };
