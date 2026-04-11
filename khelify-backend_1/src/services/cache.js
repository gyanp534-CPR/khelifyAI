const NodeCache = require('node-cache');

// Separate caches per data type for fine-grained TTL control
const caches = {
  liveScores: new NodeCache({ stdTTL: parseInt(process.env.LIVE_SCORE_CACHE_TTL) || 60 }),
  matchInfo:  new NodeCache({ stdTTL: parseInt(process.env.MATCH_INFO_CACHE_TTL) || 300 }),
  youtube:    new NodeCache({ stdTTL: parseInt(process.env.YOUTUBE_CACHE_TTL) || 1800 }),
  players:    new NodeCache({ stdTTL: parseInt(process.env.PLAYER_CACHE_TTL) || 3600 }),
  insights:   new NodeCache({ stdTTL: 120 }),
};

// Track CricAPI call count (resets at midnight UTC)
let cricApiCallCount = 0;
let lastReset = new Date().toDateString();

function checkAndResetDailyCount() {
  const today = new Date().toDateString();
  if (today !== lastReset) {
    cricApiCallCount = 0;
    lastReset = today;
    console.log('[Cache] CricAPI daily call count reset');
  }
}

module.exports = {
  get: (type, key) => caches[type]?.get(key),
  set: (type, key, value) => caches[type]?.set(key, value),
  del: (type, key) => caches[type]?.del(key),
  flush: (type) => caches[type]?.flushAll(),

  // CricAPI quota tracker (free = 100/day)
  canCallCricApi() {
    checkAndResetDailyCount();
    return cricApiCallCount < 95; // keep 5 buffer
  },
  incrementCricApiCount() {
    checkAndResetDailyCount();
    cricApiCallCount++;
    console.log(`[CricAPI] Call #${cricApiCallCount} today`);
  },
  getCricApiCount: () => cricApiCallCount,

  stats() {
    return {
      cricApiCallsToday: cricApiCallCount,
      cacheKeys: Object.fromEntries(
        Object.entries(caches).map(([k, v]) => [k, v.keys().length])
      ),
    };
  },
};
