# Khelify.ai — Cricket Intelligence Backend

Zero-budget Node.js backend for the Khelify sports intelligence app.

## Stack
- **Runtime**: Node.js + Express
- **Data**: CricAPI (free tier, 100 calls/day)
- **Videos**: YouTube Data API v3 (10,000 units/day free)
- **Analysis**: Rule-based engine (zero AI cost)
- **Hosting**: Render.com (free tier)
- **Cache**: In-memory (node-cache) — no Redis needed

---

## Local Setup

```bash
git clone <your-repo>
cd khelify-backend
npm install
cp .env.example .env
# Fill in your API keys in .env
npm run dev
```

Server runs at http://localhost:3000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API index + all routes |
| GET | `/api/health` | Keep-alive (ping from cron-job.org) |
| GET | `/api/status` | Quota usage, cache stats |
| POST | `/api/refresh` | Pull fresh data (cron trigger) |
| GET | `/api/cricket/live` | All live + recent matches |
| GET | `/api/cricket/match/:id` | Full match + AI analysis + videos |
| GET | `/api/cricket/analysis/:id` | Just the rule engine output |
| GET | `/api/cricket/series` | Active series list |
| GET | `/api/cricket/player/:id` | Player info + impact score |
| GET | `/api/cricket/player/search?q=name` | Search players |
| GET | `/api/cricket/videos?team1=X&team2=Y` | YouTube videos for a match |

---

## Deploy to Render.com (Free)

1. Push code to GitHub
2. Go to render.com → New → Web Service
3. Connect your GitHub repo
4. Render auto-detects Node.js
5. Set environment variables in Render dashboard:
   - `CRICAPI_KEY` → your key
   - `YOUTUBE_KEY` → your key
6. Deploy — done. Your URL: `https://khelify-backend.onrender.com`

**Note**: Free Render services sleep after 15 min inactivity. Set up cron-job.org to keep it awake.

---

## Auto-Refresh via cron-job.org (Free)

1. Sign up at cron-job.org (free)
2. Create two jobs:

**Job 1 — Score refresh (every 60s during match hours)**
- URL: `POST https://your-app.onrender.com/api/refresh`
- Schedule: Every minute, 12:00–23:59 IST (06:30–18:30 UTC)

**Job 2 — Keep-alive (every 10 min, all day)**
- URL: `GET https://your-app.onrender.com/api/health`
- Schedule: Every 10 minutes

This uses ~150 cron triggers/day — well within cron-job.org's free tier (10,000/month).

---

## CricAPI Quota Management

Free tier = 100 calls/day. Strategy:
- Cache all responses aggressively (60s for live, 5min for match info)
- Batch: one /currentMatches call refreshes ALL live matches at once
- Monitor: `GET /api/status` shows calls used today
- The engine auto-blocks calls when count reaches 95/day

**Typical usage**: ~60–80 calls/day for a full IPL match day.

---

## Rule Engine — Adding New Rules

Edit `src/engine/rules.js`. Each rule is a simple JS function:

```js
// Example: detect a partnership milestone
function detectPartnership(state) {
  if (state.partnership > 100 && state.over > 30) {
    return { type: 'positive', text: `Century partnership — match-defining stand in progress.` };
  }
  return null;
}
```

Add it to `analyzeMatch()`. That's it — no retraining needed.

---

## Building the ML Layer (Future)

Log every rule trigger to a file/DB:
```js
{ matchId, over, ruleTriggered, matchOutcome, timestamp }
```

After 200+ matches you have labeled data. Train a lightweight decision tree (scikit-learn) on it. Cost: still ₹0.
