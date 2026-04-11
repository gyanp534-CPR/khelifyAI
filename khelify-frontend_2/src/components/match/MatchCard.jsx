import { Link } from 'react-router-dom';
import { getTeamShort, getTeamFlag, isMatchLive, calcCRR } from '../../utils/cricket';
import './MatchCard.css';

export default function MatchCard({ match, active = false }) {
  if (!match) return null;

  const { id, name, matchType, status, score = [], teams = [], teamInfo = [] } = match;
  const live = isMatchLive(status);

  const team1Name = teamInfo?.[0]?.name || teams?.[0] || 'TBA';
  const team2Name = teamInfo?.[1]?.name || teams?.[1] || 'TBA';
  const t1Short   = getTeamShort(team1Name);
  const t2Short   = getTeamShort(team2Name);
  const t1Flag    = getTeamFlag(team1Name);
  const t2Flag    = getTeamFlag(team2Name);

  const inn1 = score?.[0];
  const inn2 = score?.[1];

  return (
    <Link to={`/match/${id}`} className={`match-card ${active ? 'active' : ''} ${live ? 'live' : ''}`}>
      {live && <div className="mc-live-bar" />}

      <div className="mc-meta">
        <span className="mc-type">{matchType?.toUpperCase() || 'MATCH'}</span>
        {live
          ? <span className="mc-status-live"><span className="live-dot" /> LIVE</span>
          : <span className="mc-status">{status?.slice(0, 36)}{status?.length > 36 ? '…' : ''}</span>
        }
      </div>

      <div className="mc-teams">
        <div className="mc-team">
          <span className="mc-flag">{t1Flag}</span>
          <span className="mc-short">{t1Short}</span>
          {inn1 && (
            <span className="mc-score mono">
              {inn1.r}/{inn1.w}
              <span className="mc-overs">({inn1.o})</span>
            </span>
          )}
        </div>
        <div className="mc-vs">vs</div>
        <div className="mc-team right">
          {inn2 && (
            <span className="mc-score mono">
              {inn2.r}/{inn2.w}
              <span className="mc-overs">({inn2.o})</span>
            </span>
          )}
          <span className="mc-short">{t2Short}</span>
          <span className="mc-flag">{t2Flag}</span>
        </div>
      </div>

      {live && inn1 && (
        <div className="mc-crr">
          CRR <strong>{calcCRR(inn1.r, parseFloat(inn1.o))}</strong>
        </div>
      )}
    </Link>
  );
}
