const express = require('express');
const router = express.Router();
const cricapi = require('../services/cricapi');

// ===============================
// LIVE MATCHES (MAIN ENDPOINT)
// ===============================
router.get('/live', async (req, res) => {
  try {
    const matches = await cricapi.getCurrentMatches();

    return res.json({
      success: true,
      count: matches.length,
      matches
    });

  } catch (err) {
    console.error('[ROUTE] Live error:', err.message);

    return res.json({
      success: false,
      matches: [],
      message: 'Failed to fetch matches'
    });
  }
});

// ===============================
// HEALTH CHECK (optional but useful)
// ===============================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'khelify-backend'
  });
});

module.exports = router;
