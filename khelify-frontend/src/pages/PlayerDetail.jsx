import { useParams, Link } from 'react-router-dom';
import { usePlayer } from '../hooks/useData';
import { gradeColor } from '../utils/cricket';
import './PlayerDetail.css';

export default function PlayerDetail() {
  const { id } = useParams();
  const { data, isLoading, isError } = usePlayer(id);

  if (isLoading) return <PlayerSkeleton />;
  if (isError || !data?.player) {
    return (
      <div className="player-error">
        <div>Player not found.</div>
        <Link to="/players" className="pd-back">← Search players</Link>
      </div>
    );
  }

  const { player, impact, videos = [] } = data;

  return (
    <div className="player-detail fade-up">
      <Link to="/players" className="pd-back">← Players</Link>

      <div className="pd-hero">
        <div className="pd-avatar">{player.name?.slice(0, 2).toUpperCase()}</div>
        <div className="pd-identity">
          <h1 className="pd-name display">{player.name?.toUpperCase()}</h1>
          <div className="pd-tags">
            {player.country && <span className="pd-tag">{player.country}</span>}
            {player.role    && <span className="pd-tag">{player.role}</span>}
            {player.battingStyle && <span className="pd-tag">{player.battingStyle}</span>}
          </div>
        </div>
        {impact && (
          <div className="pd-grade" style={{ color: gradeColor(impact.grade) }}>
            <div className="pd-grade-label">Impact</div>
            <div className="pd-grade-val">{impact.grade}</div>
            <div className="pd-grade-score mono">{impact.score}/10</div>
          </div>
        )}
      </div>

      {/* Stats grid */}
      {player.stats?.length > 0 && (
        <div className="pd-stats-section">
          <div className="pd-section-label">Career Stats</div>
          <div className="pd-stats-grid">
            {player.stats.slice(0, 6).map((s, i) => (
              <div key={i} className="pd-stat-card">
                <div className="pd-stat-type">{s.fn}</div>
                <div className="pd-stat-row">
                  <div className="pd-stat-item">
                    <span className="pd-stat-val mono">{s.bat?.runs || '—'}</span>
                    <span className="pd-stat-label">Runs</span>
                  </div>
                  <div className="pd-stat-item">
                    <span className="pd-stat-val mono">{s.bat?.avg || '—'}</span>
                    <span className="pd-stat-label">Avg</span>
                  </div>
                  <div className="pd-stat-item">
                    <span className="pd-stat-val mono">{s.bowl?.wickets || '—'}</span>
                    <span className="pd-stat-label">Wkts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact factors */}
      {impact?.factors?.length > 0 && (
        <div className="pd-impact-section">
          <div className="pd-section-label">Impact Factors</div>
          <div className="pd-factors">
            {impact.factors.map((f, i) => (
              <span key={i} className="pd-factor">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="pd-videos">
          <div className="pd-section-label">Recent Videos</div>
          <div className="pd-video-scroll scroll-x">
            {videos.slice(0, 6).map(v => (
              <a key={v.videoId} href={v.url} target="_blank" rel="noopener noreferrer" className="pd-video-card">
                {v.thumbnail && <img src={v.thumbnail} alt={v.title} loading="lazy" />}
                <div className="pd-video-title">{v.title}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerSkeleton() {
  return (
    <div className="player-detail" style={{ padding: '24px 16px', gap: 16, display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ height: 20, width: 80 }} />
      <div className="skeleton" style={{ height: 80 }} />
      <div className="skeleton" style={{ height: 200 }} />
    </div>
  );
}

if (!matchData?.match) {
  return (
    <div className="match-error">
      <div className="me-icon">⚠</div>
      <div className="me-text">Match data unavailable</div>
      <Link to="/" className="me-back">← Back</Link>
    </div>
  );
}
