# Khelify Frontend

React + Vite frontend for the Khelify cricket intelligence app.

## Tech Stack
- React 18 + React Router v6
- TanStack Query (data fetching + caching + auto-refresh)
- Zustand (global state)
- Recharts (for future graphs)
- Vite (build tool)
- PWA support via vite-plugin-pwa

## Local Dev

```bash
npm install
npm run dev
# Make sure the backend is running on localhost:3000
# Vite proxies /api → localhost:3000 automatically
```

## Production Build

```bash
npm run build
# dist/ folder is ready to deploy
```

## Deploy to Vercel

1. Push to GitHub
2. vercel.com → New Project → Import repo
3. Framework: Vite (auto-detected)
4. Set env variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy

vercel.json handles SPA routing (all routes → index.html).

## Pages
- `/`              — Live match list with filters
- `/match/:id`     — Full match: score hero + AI analysis + scorecard + videos
- `/series`        — Active series list
- `/players`       — Player search
- `/player/:id`    — Player profile with impact score + career stats + videos

## Key Design Decisions
- **Bebas Neue** for display headings — powerful, sports-grade
- **DM Sans** for body — clean, readable on mobile
- **JetBrains Mono** for scores/numbers — fixed-width feels like a scoreboard
- Dark theme only — matches ESPN/Cricbuzz energy
- Auto-refresh every 60s via TanStack Query refetchInterval
- Skeleton loading states on every data-dependent component
- Mobile-first responsive grid layouts
