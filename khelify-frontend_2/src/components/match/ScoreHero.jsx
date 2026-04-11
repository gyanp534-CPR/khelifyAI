import { getTeamShort, getTeamFlag, calcCRR, calcRRR, calcProjected, isMatchLive } from '../../utils/cricket';
import './ScoreHero.css';

export default function ScoreHero({ match }) {
  if (!match) return <div className="score-hero-skeleton" />;

  const { name, matchType, status, score = [], teams = [], teamInfo = [], series } = match;
  const live = isMatchLive(status);

  const team1Name = teamInfo?.[0]?.name || teams?.[0] || 'Team A';
  const team2Name = teamInfo?.[1]?.name || teams?.[1] || 'Team B';
  const inn1 = score?.[0];
  const inn2 = score?.[1];

  const crr = inn1 ? calcCRR(inn1.r, parseFloat(inn1.o)) : null;
  const projected = inn1 ? calcProjected(inn1.r, parseFloat(inn1.o), matchType === 't20' ? 20 : 50) : null;

  return (
    <div className={`score-hero ${live ? 'live' : ''}`}>
      <div className="sh-top-bar">
        <span className="sh-tournament">{name || series || 'Cricket Match'}</span>
        {live
          ? <span className="sh-live-badge"><span className="live-dot" /> LIVE</span>
          : <span className="sh-status">{status}</span>
        }
      </div>

      <div className="sh-teams">
        {/* Team 1 */}
        <div className="sh-team">
          <div className="sh-flag">{getTeamFlag(team1Name)}</div>
          <div className="sh-team-name display">{getTeamShort(team1Name)}</div>
          {inn1 ? (
            <div className="sh-score-block">
              <span className="sh-runs mono">{inn1.r}<span className="sh-wkts">/{inn1.w}</span></span>
              <span className="sh-overs">({inn1.o} ov)</span>
            </div>
          ) : (
            <div className="sh-yet">Yet to bat</div>
          )}
        </div>

        {/* Center */}
        <div className="sh-center">
          <div className="sh-vs">VS</div>
          {live && crr && (
            <div className="sh-crr-badge">
              <span className="sh-crr-label">CRR</span>
              <span className="sh-crr-val mono">{crr}</span>
            </div>
          )}
        </div>

        {/* Team 2 */}
        <div className="sh-team right">
          <div className="sh-flag">{getTeamFlag(team2Name)}</div>
          <div className="sh-team-name display">{getTeamShort(team2Name)}</div>
          {inn2 ? (
            <div className="sh-score-block">
              <span className="sh-runs mono">{inn2.r}<span className="sh-wkts">/{inn2.w}</span></span>
              <span className="sh-overs">({inn2.o} ov)</span>
            </div>
          ) : (
            <div className="sh-yet">Yet to bat</div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {live && inn1 && (
        <div className="sh-stats-bar">
          <div className="sh-stat">
            <span className="sh-stat-label">CRR</span>
            <span className="sh-stat-val mono green">{crr}</span>
          </div>
          <div className="sh-stat-divider" />
          <div className="sh-stat">
            <span className="sh-stat-label">Projected</span>
            <span className="sh-stat-val mono">{projected}</span>
          </div>
          <div className="sh-stat-divider" />
          <div className="sh-stat">
            <span className="sh-stat-label">Match type</span>
            <span className="sh-stat-val mono">{(matchType || 'ODI').toUpperCase()}</span>
          </div>
          <div className="sh-stat-divider" />
          <div className="sh-stat">
            <span className="sh-stat-label">Overs</span>
            <span className="sh-stat-val mono">{inn1.o} / {matchType === 't20' ? 20 : 50}</span>
          </div>
        </div>
      )}

      {!live && status && (
        <div className="sh-result">{status}</div>
      )}
    </div>
  );
}
