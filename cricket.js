const express  = require('express');
const router   = express.Router();
const cricapi  = require('../services/cricapi');
const youtube  = require('../services/youtube');
const engine   = require('../engine/rules');
const cache    = require('../services/cache');

// GET /api/cricket/live
// Returns all live + recent matches with basic scores
router.get('/live', async (req, res) => {
  try {
    const data = await cricapi.getCurrentMatches();
    if (!data) return res.status(503).json({ error: 'Score data unavailable — API limit or network issue', cached: false });

    const matches = (data.data || []).map(m => ({
      id:         m.id,
      name:       m.name,
      matchType:  m.matchType,
      status:     m.status,
      venue:      m.venue,
      date:       m.date,
      teams:      m.teams,
      teamInfo:   m.teamInfo,
      score:      m.score,
      series:     m.series_id,
    }));

    res.json({ success: true, count: matches.length, matches, source: 'CricAPI', updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[/live]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cricket/match/:id
// Full match details + AI analysis
router.get('/match/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [matchData, scorecardData] = await Promise.all([
      cricapi.getMatchScore(id),
      cricapi.getMatchScorecard(id),
    ]);

    if (!matchData) return res.status(404).json({ error: 'Match not found or API unavailable' });

    const match = matchData.data;

    // Run the rule engine
    const analysis = engine.analyzeMatch(match);

    // Fetch YouTube videos (non-blocking)
    const ytContext = {
      team1:      match.teamInfo?.[0]?.name || match.teams?.[0] || '',
      team2:      match.teamInfo?.[1]?.name || match.teams?.[1] || '',
      tournament: match.series_id || '',
      matchType:  match.matchType,
    };
    const videos = await youtube.fetchVideosForMatch(ytContext).catch(() => null);

    res.json({
      success:  true,
      match,
      scorecard: scorecardData?.data || null,
      analysis,
      videos:   videos || { highlights: [], analysis: [], reactions: [] },
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[/match/${req.params.id}]`, err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cricket/analysis/:id
// Just the AI analysis for a match (lightweight, called frequently)
router.get('/analysis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `analysis_${id}`;
    const cached = cache.get('insights', cacheKey);
    if (cached) return res.json({ success: true, ...cached, fromCache: true });

    const matchData = await cricapi.getMatchScore(id);
    if (!matchData?.data) return res.status(404).json({ error: 'Match not found' });

    const analysis = engine.analyzeMatch(matchData.data);
    cache.set('insights', cacheKey, analysis);

    res.json({ success: true, ...analysis });
  } catch (err) {
    console.error(`[/analysis/${req.params.id}]`, err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cricket/series
// All active series
router.get('/series', async (req, res) => {
  try {
    const data = await cricapi.getSeries();
    if (!data) return res.status(503).json({ error: 'Series data unavailable' });
    res.json({ success: true, series: data.data || [], updatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cricket/player/:id
// Player info + impact score
router.get('/player/:id', async (req, res) => {
  try {
    const data = await cricapi.getPlayer(req.params.id);
    if (!data?.data) return res.status(404).json({ error: 'Player not found' });

    const player = data.data;
    const impact = engine.scorePlayerImpact(player);

    // Fetch player videos too
    const videos = await youtube.fetchVideosForPlayer(player.name).catch(() => []);

    res.json({ success: true, player, impact, videos, updatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cricket/player/search?q=virat
router.get('/player/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) return res.status(400).json({ error: 'Search term too short' });

    const data = await cricapi.searchPlayers(q);
    res.json({ success: true, players: data?.data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cricket/videos?team1=India&team2=Pakistan&tournament=Champions+Trophy
// Standalone video fetch
router.get('/videos', async (req, res) => {
  try {
    const { team1, team2, tournament, matchType } = req.query;
    if (!team1 || !team2) return res.status(400).json({ error: 'team1 and team2 required' });

    const videos = await youtube.fetchVideosForMatch({ team1, team2, tournament, matchType });
    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
