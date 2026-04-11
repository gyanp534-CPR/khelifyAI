const axios = require('axios');
const cache = require('./cache');

const BASE = process.env.CRICAPI_BASE;
const KEY  = process.env.CRICAPI_KEY;

// ===============================
// CRICAPI INSTANCE
// ===============================
const api = axios.create({
  baseURL: BASE,
  timeout: 8000,
  params: { apikey: KEY },
});

// ===============================
// ESPN FETCH (FALLBACK + MERGE)
// ===============================
async function fetchESPNMatches() {
  try {
    const res = await axios.get(
      'https://site.api.espncricinfo.com/apis/site/v2/sports/cricket/matches/live'
    );

    return res.data.events || [];
  } catch (err) {
    console.error('[ESPN] Failed:', err.message);
    return [];
  }
}

// ===============================
// NORMALIZER
// ===============================
function normalizeMatch(m, source) {
  if (source === 'cricapi') {
    return {
      id: m.id,
      name: m.name,
      status: m.status,
      teams: m.teams,
      score: m.score,
      venue: m.venue,
      source: 'cricapi'
    };
  }

  if (source === 'espn') {
    const comp = m.competitions?.[0];

    return {
      id: m.id,
      name: m.name,
      status: m.status?.type?.description,
      teams: comp?.competitors?.map(t => t.team.name),
      score: comp?.competitors?.map(t => t.score),
      venue: comp?.venue?.fullName,
      source: 'espn'
    };
  }

  return null;
}

// ===============================
// CACHE WRAPPER
// ===============================
async function fetchWithCache(cacheType, cacheKey, endpoint, params = {}) {
  const cached = cache.get(cacheType, cacheKey);

  if (cached) {
    console.log(`[CricAPI] Cache HIT: ${cacheKey}`);
    return cached;
  }

  if (!cache.canCallCricApi()) {
    console.warn('[CricAPI] Quota limit reached');
    return null;
  }

  try {
    cache.incrementCricApiCount();

    const { data } = await api.get(endpoint, { params });

    if (data.status !== 'success') {
      console.error('[CricAPI] API error:', data.reason);
      return null;
    }

    cache.set(cacheType, cacheKey, data);
    return data;

  } catch (err) {
    console.error('[CricAPI] Request failed:', err.message);
    return null;
  }
}

// ===============================
// 🧠 AI INSIGHTS ENGINE
// ===============================
function generateInsights(match) {
  const insights = [];

  const status = (match.status || '').toLowerCase();
  const score = JSON.stringify(match.score || '');

  if (status.includes('live')) {
    insights.push('🔥 Match is live');
  }

  if (score.includes('/0') || score.includes('/1')) {
    insights.push('⚡ Strong start by batting side');
  }

  if (score.includes('/5') || score.includes('/6')) {
    insights.push('💥 Middle order under pressure');
  }

  if (!match.score || match.score.length === 0) {
    insights.push('⏳ Match yet to start');
  }

  return insights;
}

// ===============================
// 📊 CONFIDENCE SCORE
// ===============================
function generateConfidence(match) {
  return match.source === 'cricapi' ? 0.9 : 0.7;
}

// ===============================
// 🔥 CORE ENGINE (MERGE + DEDUPE)
// ===============================
async function getCurrentMatches() {
  let cricMatches = [];
  let espnMatches = [];

  // 1️⃣ Fetch CricAPI
  try {
    const cricData = await fetchWithCache(
      'liveScores',
      'current_matches',
      '/currentMatches',
      { offset: 0 }
    );

    if (cricData?.data?.length > 0) {
      cricMatches = cricData.data.map(m =>
        normalizeMatch(m, 'cricapi')
      );
    }
  } catch (e) {
    console.warn('[ENGINE] CricAPI failed');
  }

  // 2️⃣ Fetch ESPN
  try {
    const espnData = await fetchESPNMatches();

    if (espnData.length > 0) {
      espnMatches = espnData.map(m =>
        normalizeMatch(m, 'espn')
      );
    }
  } catch (e) {
    console.warn('[ENGINE] ESPN failed');
  }

  // ===============================
  // 🔥 MERGE + DEDUPLICATION
  // ===============================
  const mergedMap = new Map();

  function getKey(match) {
    return (match.teams || [])
      .join('-')
      .toLowerCase()
      .replace(/\s/g, '');
  }

  [...cricMatches, ...espnMatches].forEach(match => {
    if (!match) return;

    const key = getKey(match);

    if (!mergedMap.has(key)) {
      mergedMap.set(key, match);
    } else {
      const existing = mergedMap.get(key);

      // Prefer CricAPI data
      if (existing.source === 'espn' && match.source === 'cricapi') {
        mergedMap.set(key, match);
      }
    }
  });

  let finalMatches = Array.from(mergedMap.values());

  // ===============================
  // 🧠 ADD AI LAYER
  // ===============================
  finalMatches = finalMatches.map(match => ({
    ...match,
    insights: generateInsights(match),
    confidence: generateConfidence(match)
  }));

  // ===============================
  // CACHE FINAL RESULT
  // ===============================
  cache.set('liveScores', 'normalized_matches', finalMatches);

  return finalMatches;
}

// ===============================
// EXPORTS
// ===============================
module.exports = {
  getCurrentMatches,

  async getLiveScores() {
    return fetchWithCache('liveScores', 'live_scores', '/cricScore');
  },

  async getMatchScore(matchId) {
    return fetchWithCache('liveScores', `score_${matchId}`, '/match', { id: matchId });
  },

  async getMatchScorecard(matchId) {
    return fetchWithCache('matchInfo', `scorecard_${matchId}`, '/match_scorecard', { id: matchId });
  },

  async getSeries() {
    return fetchWithCache('matchInfo', 'series_list', '/series', { offset: 0 });
  },

  async getSeriesMatches(seriesId) {
    return fetchWithCache('matchInfo', `series_matches_${seriesId}`, '/series_info', { id: seriesId });
  },

  async getPlayer(playerId) {
    return fetchWithCache('players', `player_${playerId}`, '/players_info', { id: playerId });
  },

  async searchPlayers(name) {
    return fetchWithCache('players', `search_${name.toLowerCase()}`, '/players', {
      search: name,
      offset: 0
    });
  },
};
