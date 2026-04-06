const axios = require('axios');
const cache = require('./cache');

const BASE = process.env.YOUTUBE_BASE;
const KEY  = process.env.YOUTUBE_KEY;

const ytApi = axios.create({ baseURL: BASE, timeout: 8000 });

// Auto-categorize a video from its title + description
function categorize(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();

  const highlightPatterns = /highlight|best moment|wicket|six|century|hat.?trick|boundary|catch|stunning|incredible|unbelievable|top \d/;
  const analysisPatterns  = /analysis|breakdown|tactical|review|expert|preview|prediction|explained|why|how|strategy|pitch report/;
  const reactionPatterns  = /reaction|react|fan|crowd|watched|live watch|watching|stadium/;

  if (highlightPatterns.test(text)) return 'highlight';
  if (analysisPatterns.test(text))  return 'analysis';
  if (reactionPatterns.test(text))  return 'reaction';
  return 'highlight'; // default
}

// Build smart queries from match context
function buildQueries(matchContext) {
  const { team1, team2, tournament, matchType } = matchContext;
  const base = `${team1} vs ${team2}`;
  const tourStr = tournament ? ` ${tournament}` : '';

  return [
    `${base}${tourStr} highlights 2025`,
    `${base}${tourStr} match analysis`,
    `${base} reaction 2025`,
  ];
}

// Fetch + categorize videos for a match
async function fetchVideosForMatch(matchContext) {
  const cacheKey = `yt_${matchContext.team1}_${matchContext.team2}`.replace(/\s+/g, '_').toLowerCase();
  const cached = cache.get('youtube', cacheKey);
  if (cached) return cached;

  const queries = buildQueries(matchContext);
  const allVideos = [];

  for (const q of queries) {
    try {
      const { data } = await ytApi.get('/search', {
        params: {
          key: KEY,
          q,
          part: 'snippet',
          type: 'video',
          maxResults: 5,
          order: 'date',
          relevanceLanguage: 'en',
          regionCode: 'IN',
        },
      });

      if (data.items) {
        const videos = data.items.map(item => ({
          videoId:     item.id.videoId,
          title:       item.snippet.title,
          channel:     item.snippet.channelTitle,
          thumbnail:   item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          publishedAt: item.snippet.publishedAt,
          url:         `https://www.youtube.com/watch?v=${item.id.videoId}`,
          category:    categorize(item.snippet.title, item.snippet.description),
        }));
        allVideos.push(...videos);
      }
    } catch (err) {
      console.error(`[YouTube] Failed query "${q}":`, err.message);
    }
  }

  // Deduplicate by videoId
  const seen = new Set();
  const unique = allVideos.filter(v => {
    if (seen.has(v.videoId)) return false;
    seen.add(v.videoId);
    return true;
  });

  // Group by category
  const grouped = {
    highlights: unique.filter(v => v.category === 'highlight').slice(0, 4),
    analysis:   unique.filter(v => v.category === 'analysis').slice(0, 3),
    reactions:  unique.filter(v => v.category === 'reaction').slice(0, 3),
    all:        unique,
  };

  cache.set('youtube', cacheKey, grouped);
  return grouped;
}

// Fetch videos for a player
async function fetchVideosForPlayer(playerName) {
  const cacheKey = `yt_player_${playerName.replace(/\s+/g, '_').toLowerCase()}`;
  const cached = cache.get('youtube', cacheKey);
  if (cached) return cached;

  try {
    const { data } = await ytApi.get('/search', {
      params: {
        key: KEY,
        q: `${playerName} cricket 2025 highlights`,
        part: 'snippet',
        type: 'video',
        maxResults: 6,
        order: 'date',
        regionCode: 'IN',
      },
    });

    const videos = (data.items || []).map(item => ({
      videoId:     item.id.videoId,
      title:       item.snippet.title,
      channel:     item.snippet.channelTitle,
      thumbnail:   item.snippet.thumbnails?.medium?.url,
      publishedAt: item.snippet.publishedAt,
      url:         `https://www.youtube.com/watch?v=${item.id.videoId}`,
      category:    categorize(item.snippet.title, item.snippet.description),
    }));

    cache.set('youtube', cacheKey, videos);
    return videos;
  } catch (err) {
    console.error(`[YouTube] Player videos failed for ${playerName}:`, err.message);
    return [];
  }
}

module.exports = { fetchVideosForMatch, fetchVideosForPlayer, categorize };
