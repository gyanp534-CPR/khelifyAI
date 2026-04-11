require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { generalLimiter, refreshLimiter } = require('./middleware/rateLimiter');

const cricketRoutes = require('./routes/cricket');
const systemRoutes  = require('./routes/system');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://khelify-ai.vercel.app',   // ✅ your actual frontend
    'http://localhost:5173'            // optional (for local dev)
  ],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(generalLimiter);

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/cricket', cricketRoutes);

// Apply strict rate limit to refresh (cron endpoint)
app.post('/api/refresh', refreshLimiter);
app.use('/api', systemRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'Khelify.ai Cricket Backend',
    version: '1.0.0',
    endpoints: {
      health:        'GET /api/health',
      status:        'GET /api/status',
      refresh:       'POST /api/refresh',
      liveScores:    'GET /api/cricket/live',
      matchDetail:   'GET /api/cricket/match/:id',
      matchAnalysis: 'GET /api/cricket/analysis/:id',
      series:        'GET /api/cricket/series',
      player:        'GET /api/cricket/player/:id',
      playerSearch:  'GET /api/cricket/player/search?q=virat',
      videos:        'GET /api/cricket/videos?team1=India&team2=Pakistan',
    },
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏏 Khelify Backend running on port ${PORT}`);
  console.log(`   ENV:          ${process.env.NODE_ENV}`);
  console.log(`   CricAPI key:  ${process.env.CRICAPI_KEY?.slice(0, 8)}...`);
  console.log(`   YouTube key:  ${process.env.YOUTUBE_KEY?.slice(0, 8)}...`);
  console.log(`\n   API root: http://localhost:${PORT}/\n`);
});

module.exports = app;
