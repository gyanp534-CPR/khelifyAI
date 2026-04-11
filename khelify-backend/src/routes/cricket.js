const express = require('express');
const router = express.Router();
const cricapi = require('../services/cricapi');

// ===============================
// LIVE MATCHES
// ===============================
router.get('/live', async (req, res) => {
  try {
    const matches = await cricapi.getCurrentMatches();

    // ✅ SAFETY: always return array
    if (!Array.isArray(matches)) {
      console.warn('[ROUTE] Invalid matches format');
      return res.json({
        success: true,
        count: 0,
        matches: []
      });
    }

    return res.json({
      success: true,
      count: matches.length,
      matches
    });

  } catch (err) {
    console.error('[ROUTE] Live error:', err.message);

    return res.status(500).json({
      success: false,
      matches: [],
      message: 'Failed to fetch matches'
    });
  }
});

// ===============================
// HEALTH
// ===============================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'khelify-backend'
  });
});

module.exports = router;
