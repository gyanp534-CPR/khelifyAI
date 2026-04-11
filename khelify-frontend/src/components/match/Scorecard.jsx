import { useState } from 'react';
import './Scorecard.css';

export default function Scorecard({ scorecard, loading }) {
  const [tab, setTab] = useState(0);
  if (loading) return <ScorecardSkeleton />;
  if (!scorecard?.scorecard?.length) return null;

  const innings = scorecard.scorecard;

  return (
    <div className="scorecard fade-up fade-up-4">
      <div className="sc-header">
        <div className="sc-title-row">
          <span className="sc-icon">📋</span>
          <span className="sc-title">Scorecard</span>
        </div>
        {innings.length > 1 && (
          <div className="sc-tabs">
            {innings.map((inn, i) => (
              <button
                key={i}
                className={`sc-tab ${tab === i ? 'active' : ''}`}
                onClick={() => setTab(i)}
              >
                {inn.inning?.split(' ').slice(0, 2).join(' ') || `Innings ${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {innings[tab] && <InningsPanel innings={innings[tab]} />}
    </div>
  );
}

function InningsPanel({ innings }) {
  const batters = innings.batting || [];
  const bowlers = innings.bowling || [];

  return (
    <div className="sc-innings">
      {/* Batting table */}
      {batters.length > 0 && (
        <div className="sc-section">
          <div className="sc-section-label">Batting</div>
          <div className="sc-table-wrap scroll-x">
            <table className="sc-table">
              <thead>
                <tr>
                  <th className="sc-th-name">Batter</th>
                  <th>R</th>
                  <th>B</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                </tr>
              </thead>
              <tbody>
                {batters.map((b, i) => (
                  <tr key={i} className={b.dismissal === 'not out' || !b.dismissal ? 'not-out' : ''}>
                    <td className="sc-td-name">
                      <div className="sc-batter-name">{b.batsman?.name || b.batsman || '—'}</div>
                      <div className="sc-dismissal">{b.dismissal || ''}</div>
                    </td>
                    <td className="sc-runs">{b.r ?? '—'}</td>
                    <td>{b.b ?? '—'}</td>
                    <td>{b['4s'] ?? '—'}</td>
                    <td>{b['6s'] ?? '—'}</td>
                    <td className={getSRColor(b.sr)}>
                      {b.sr ? parseFloat(b.sr).toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bowling table */}
      {bowlers.length > 0 && (
        <div className="sc-section">
          <div className="sc-section-label">Bowling</div>
          <div className="sc-table-wrap scroll-x">
            <table className="sc-table">
              <thead>
                <tr>
                  <th className="sc-th-name">Bowler</th>
                  <th>O</th>
                  <th>M</th>
                  <th>R</th>
                  <th>W</th>
                  <th>Eco</th>
                </tr>
              </thead>
              <tbody>
                {bowlers.map((b, i) => (
                  <tr key={i}>
                    <td className="sc-td-name">
                      <div className="sc-batter-name">{b.bowler?.name || b.bowler || '—'}</div>
                    </td>
                    <td>{b.o ?? '—'}</td>
                    <td>{b.m ?? '—'}</td>
                    <td>{b.r ?? '—'}</td>
                    <td className={b.w >= 3 ? 'sc-highlight-wickets' : ''}>{b.w ?? '—'}</td>
                    <td className={getEcoColor(b.eco)}>
                      {b.eco ? parseFloat(b.eco).toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function getSRColor(sr) {
  if (!sr) return '';
  const v = parseFloat(sr);
  if (v >= 150) return 'sc-green';
  if (v >= 100) return 'sc-amber';
  if (v < 60)   return 'sc-red';
  return '';
}

function getEcoColor(eco) {
  if (!eco) return '';
  const v = parseFloat(eco);
  if (v < 5)  return 'sc-green';
  if (v < 8)  return 'sc-amber';
  return 'sc-red';
}

function ScorecardSkeleton() {
  return (
    <div className="scorecard">
      <div className="sc-header">
        <div className="skeleton" style={{ height: 16, width: 120 }} />
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 28 }} />)}
      </div>
    </div>
  );
}
