const express = require('express');
const router  = express.Router();
const cache   = require('../services/cache');
const cricapi = require('../services/cricapi');
const engine  = require('../engine/rules');

// GET /api/health
// Keep-alive endpoint (cron-job.org pings this every 10 min)
router.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'Khelify Backend',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    uptime:    Math.round(process.uptime()),
  });
});

// GET /api/status
// Full system status — quota, cache hits, etc.
router.get('/status', (req, res) => {
  const stats = cache.stats();
  res.json({
    status: 'ok',
    cricapi: {
      callsToday:     stats.cricApiCallsToday,
      dailyLimit:     100,
      remaining:      100 - stats.cricApiCallsToday,
      canCall:        cache.canCallCricApi(),
    },
    cache: stats.cacheKeys,
    memory: {
      heapUsed:  Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    },
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/refresh
// Called by cron-job.org every 60 seconds — pulls fresh data, pre-warms cache
router.post('/refresh', async (req, res) => {
  try {
    console.log('[Refresh] Triggered at', new Date().toISOString());

    // Pull current matches (1 API call)
    const data = await cricapi.getCurrentMatches();

    if (!data?.data) {
      return res.json({ refreshed: false, reason: 'No data from CricAPI or quota hit' });
    }

    const liveMatches = data.data.filter(m =>
      m.status?.toLowerCase().includes('live') ||
      m.status?.toLowerCase().includes('over') ||
      m.status?.toLowerCase().includes('innings')
    );

    // Pre-generate insights for live matches (no extra API calls — uses match data we already have)
    let insightsGenerated = 0;
    for (const match of liveMatches.slice(0, 3)) {
      const analysis = engine.analyzeMatch(match);
      cache.set('insights', `analysis_${match.id}`, analysis);
      insightsGenerated++;
    }

    res.json({
      refreshed:          true,
      totalMatches:       data.data.length,
      liveMatches:        liveMatches.length,
      insightsGenerated,
      cricApiCallsToday:  cache.getCricApiCount(),
      timestamp:          new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Refresh] Error:', err.message);
    res.status(500).json({ refreshed: false, error: err.message });
  }
});

// DELETE /api/cache
// Manual cache flush for dev/debugging
router.delete('/cache', (req, res) => {
  ['liveScores', 'matchInfo', 'youtube', 'players', 'insights'].forEach(t => cache.flush(t));
  res.json({ flushed: true });
});

module.exports = router;
