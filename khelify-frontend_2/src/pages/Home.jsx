import { useState } from 'react';
import { useLiveMatches } from '../hooks/useData';
import MatchCard from '../components/match/MatchCard';
import { isMatchLive } from '../utils/cricket';
import './Home.css';

const FILTERS = ['all', 'live', 'recent', 'upcoming'];

export default function Home() {
  const { data: matches = [], isLoading, isError, dataUpdatedAt } = useLiveMatches();
  const [filter, setFilter] = useState('all');

  const filtered = matches.filter(m => {
    const s = (m.status || '').toLowerCase();
    const live = isMatchLive(m.status);
    if (filter === 'live')     return live;
    if (filter === 'recent')   return !live && (s.includes('won') || s.includes('draw') || s.includes('tied'));
    if (filter === 'upcoming') return !live && (s.includes('toss') || s.includes('start') || s.includes('match'));
    return true;
  });

  const liveCount = matches.filter(m => isMatchLive(m.status)).length;

  return (
    <div className="home fade-up">
      {/* Hero header */}
      <div className="home-hero">
        <div className="home-hero-text">
          <h1 className="home-heading display">
            CRICKET<br />
            <span className="home-heading-accent">INTELLIGENCE</span>
          </h1>
          <p className="home-sub">Live scores · AI analysis · Smart video feed</p>
        </div>
        <div className="home-hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-val mono">{liveCount}</span>
            <span className="hero-stat-label">Live Now</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-val mono">{matches.length}</span>
            <span className="hero-stat-label">Total Matches</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="home-filters scroll-x">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'live' && liveCount > 0 && <span className="live-dot" style={{ marginRight: 5 }} />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'live' && liveCount > 0 && (
              <span className="filter-count">{liveCount}</span>
            )}
          </button>
        ))}
        {dataUpdatedAt && (
          <span className="home-updated mono">
            Updated {new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Match grid */}
      {isLoading && <MatchGridSkeleton />}

      {isError && (
        <div className="home-error">
          <div className="error-icon">⚠</div>
          <div className="error-text">Could not fetch matches. Backend may be waking up — try again in 30s.</div>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="home-empty">
          <div className="empty-icon">🏏</div>
          <div className="empty-text">No {filter !== 'all' ? filter : ''} matches right now.</div>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="matches-grid">
          {filtered.map((m, i) => (
            <div key={m.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <MatchCard match={m} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchGridSkeleton() {
  return (
    <div className="matches-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton" style={{ height: 110, borderRadius: 10 }} />
      ))}
    </div>
  );
}
