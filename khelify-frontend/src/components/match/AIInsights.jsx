import { getInsightColor, getInsightBg, getWinProbColor } from '../../utils/cricket';
import './AIInsights.css';

export default function AIInsights({ ai, loading }) {
  if (loading) return <InsightsSkeleton />;
 if (!ai) return null;

  return (
    <div className="ai-insights fade-up fade-up-2">
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-icon">✦</div>
          <span className="ai-title">AI Match Analysis</span>
        </div>
        <span className="ai-badge">Rule Engine</span>
      </div>

      {/* Narrative headline */}
      {narrative && (
        <div className="ai-narrative">
          <div className="ai-narrative-headline">{narrative.headline}</div>
          <div className="ai-narrative-summary">{narrative.summary}</div>
        </div>
      )}

      {/* Turning point */}
      {turningPoint && (
        <div className="ai-turning-point">
          <div className="ai-tp-label">⚡ Turning Point</div>
          <div className="ai-tp-text">{turningPoint.text}</div>
        </div>
      )}

      {/* Win probability */}
      {winProbability && (
        <div className="ai-winprob">
          <div className="ai-winprob-row">
            <span className="ai-winprob-team">Batting</span>
            <div className="ai-winprob-bar">
              <div
                className="ai-winprob-fill"
                style={{
                  width: `${winProbability.batting}%`,
                  background: getWinProbColor(winProbability.batting),
                }}
              />
            </div>
            <span
              className="ai-winprob-val mono"
              style={{ color: getWinProbColor(winProbability.batting) }}
            >
              {winProbability.batting}%
            </span>
          </div>
          <div className="ai-winprob-row">
            <span className="ai-winprob-team">Fielding</span>
            <div className="ai-winprob-bar">
              <div
                className="ai-winprob-fill"
                style={{
                  width: `${winProbability.fielding}%`,
                  background: getWinProbColor(winProbability.fielding),
                }}
              />
            </div>
            <span
              className="ai-winprob-val mono"
              style={{ color: getWinProbColor(winProbability.fielding) }}
            >
              {winProbability.fielding}%
            </span>
          </div>
        </div>
      )}

      {/* Insights list */}
      {insights.length > 0 && (
        <div className="ai-insights-list">
          {insights.map((ins, i) => (
            <div
              key={i}
              className="ai-insight-item"
              style={{
                borderLeftColor: getInsightColor(ins.type),
                background: getInsightBg(ins.type),
              }}
            >
              <div className="ai-insight-type" style={{ color: getInsightColor(ins.type) }}>
                {insightIcon(ins.type)} {ins.type.toUpperCase()}
              </div>
              <div className="ai-insight-text">{ins.text}</div>
            </div>
          ))}
        </div>
      )}

      {insights.length === 0 && !turningPoint && (
        <div className="ai-no-insights">Analysis updates as the match progresses.</div>
      )}
    </div>
  );
}

function insightIcon(type) {
  return { positive: '↑', danger: '↓', warning: '⚠', turning_point: '⚡' }[type] || '•';
}

function InsightsSkeleton() {
  return (
    <div className="ai-insights">
  <p><strong>Win Probability:</strong> {ai.winProbability}%</p>
  <p><strong>Phase:</strong> {ai.phase}</p>
  <p><strong>Momentum:</strong> {ai.momentum}</p>
  <p><strong>CRR:</strong> {ai.currentRunRate}</p>
  {ai.requiredRunRate && (
    <p><strong>RRR:</strong> {ai.requiredRunRate}</p>
  )}
  <p><strong>Insight:</strong> {ai.insight}</p>
  <p><strong>Commentary:</strong> {ai.commentary}</p>
  {ai.turningPoint && (
    <p><strong>Turning Point:</strong> {ai.turningPoint}</p>
  )}
</div>
  );
}
