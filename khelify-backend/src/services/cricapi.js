const axios = require('axios');
const cache = require('./cache');
const { enrichMatch } = require('../engine/aiEngine');

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
// ESPN FETCH
// ===============================
async function fetchESPNMatches() {
  try {
    const res = await axios.get(
      'https://site.api.espncricinfo.com/apis/site/v2/sports/cricket/matches/live'
    );
    return res.data.events || [];
  } catch (err) {
    console.warn('[ESPN] Disabled (network blocked)');
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
// 🔥 MAIN ENGINE (SAFE VERSION)
// ===============================
async function getCurrentMatches() {
  let cricMatches = [];

  // 1️⃣ CricAPI ONLY (disable ESPN for stability)
  try {
    const cricData = await fetchWithCache(
      'liveScores',
      'current_matches',
      '/currentMatches',
      { offset: 0 }
    );

    if (cricData?.data?.length > 0) {
      cricMatches = cricData.data
        .map(m => normalizeMatch(m, 'cricapi'))
        .filter(Boolean);
    }
  } catch (e) {
    console.warn('[ENGINE] CricAPI failed');
  }

  let matches = cricMatches;

  // ===============================
  // 🧠 SAFE AI ENGINE (NO CRASH)
  // ===============================
  try {
    matches = matches.map(match => {
      try {
        return enrichMatch(match);
      } catch (e) {
        console.warn('[AI] Failed for match:', match.id);
        return match; // fallback
      }
    });
  } catch (e) {
    console.warn('[AI] Global failure, skipping AI layer');
  }

  // ===============================
  // CACHE
  // ===============================
  cache.set('liveScores', 'normalized_matches', matches);

  return matches;
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
