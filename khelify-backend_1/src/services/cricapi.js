const axios = require('axios');
const cache = require('./cache');

const BASE = process.env.CRICAPI_BASE;
const KEY  = process.env.CRICAPI_KEY;

const api = axios.create({
  baseURL: BASE,
  timeout: 8000,
  params: { apikey: KEY },
});

// Generic fetch with cache guard
async function fetchWithCache(cacheType, cacheKey, endpoint, params = {}) {
  const cached = cache.get(cacheType, cacheKey);
  if (cached) {
    console.log(`[CricAPI] Cache HIT: ${cacheKey}`);
    return cached;
  }

  if (!cache.canCallCricApi()) {
    console.warn('[CricAPI] Daily quota near limit — returning stale/empty');
    return null;
  }

  try {
    cache.incrementCricApiCount();
    const { data } = await api.get(endpoint, { params });

    if (data.status !== 'success') {
      console.error(`[CricAPI] API error on ${endpoint}:`, data.reason);
      return null;
    }

    cache.set(cacheType, cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[CricAPI] Request failed: ${endpoint}`, err.message);
    return null;
  }
}

module.exports = {
  // All current matches (live + recent + upcoming)
  async getCurrentMatches() {
    return fetchWithCache('liveScores', 'current_matches', '/currentMatches', { offset: 0 });
  },

  // Live scores only
  async getLiveScores() {
    return fetchWithCache('liveScores', 'live_scores', '/cricScore');
  },

  // Single match scorecard
  async getMatchScore(matchId) {
    return fetchWithCache('liveScores', `score_${matchId}`, '/match', { id: matchId });
  },

  // Match scorecard with full details
  async getMatchScorecard(matchId) {
    return fetchWithCache('matchInfo', `scorecard_${matchId}`, '/match_scorecard', { id: matchId });
  },

  // Series list
  async getSeries() {
    return fetchWithCache('matchInfo', 'series_list', '/series', { offset: 0 });
  },

  // Series matches
  async getSeriesMatches(seriesId) {
    return fetchWithCache('matchInfo', `series_matches_${seriesId}`, '/series_info', { id: seriesId });
  },

  // Player info
  async getPlayer(playerId) {
    return fetchWithCache('players', `player_${playerId}`, '/players_info', { id: playerId });
  },

  // Search players
  async searchPlayers(name) {
    return fetchWithCache('players', `search_${name.toLowerCase()}`, '/players', { search: name, offset: 0 });
  },
};
