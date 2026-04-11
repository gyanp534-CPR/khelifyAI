import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cricketApi } from '../services/api';
import './Players.css';

export default function Players() {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['player-search', search],
    queryFn:  () => cricketApi.searchPlayers(search),
    enabled:  search.length >= 2,
    staleTime: 5 * 60_000,
    select: d => d?.players ?? [],
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (q.trim().length >= 2) setSearch(q.trim());
  }

  return (
    <div className="players-page fade-up">
      <div className="players-head">
        <h1 className="players-title display">PLAYERS</h1>
        <p className="players-sub">Search any cricket player for stats and impact scores</p>
      </div>

      <form className="players-search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="players-search-input"
          placeholder="Search player name… e.g. Virat Kohli"
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
        />
        <button type="submit" className="players-search-btn">
          Search
        </button>
      </form>

      {(isLoading || isFetching) && search && (
        <div className="players-loading">
          <div className="spinner" />
          Searching...
        </div>
      )}

      {data && data.length === 0 && (
        <div className="players-empty">No players found for "{search}".</div>
      )}

      {data && data.length > 0 && (
        <div className="players-grid">
          {data.map((p, i) => (
            <Link
              key={p.id || i}
              to={`/player/${p.id}`}
              className="player-card fade-up"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="pc-avatar">
                {p.name?.slice(0, 2).toUpperCase() || 'PL'}
              </div>
              <div className="pc-info">
                <div className="pc-name">{p.name}</div>
                <div className="pc-meta">
                  {p.country && <span>{p.country}</span>}
                  {p.role && <span>· {p.role}</span>}
                </div>
              </div>
              <div className="pc-arrow">→</div>
            </Link>
          ))}
        </div>
      )}

      {!search && (
        <div className="players-hint">
          <div className="hint-icon">🏏</div>
          <div className="hint-text">Type a player name above to search</div>
          <div className="hint-suggestions">
            {['Virat Kohli', 'Rohit Sharma', 'Shubman Gill', 'Jasprit Bumrah', 'Babar Azam'].map(name => (
              <button key={name} className="hint-chip" onClick={() => { setQ(name); setSearch(name); }}>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
