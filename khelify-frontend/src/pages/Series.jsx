import { Link } from 'react-router-dom';
import './Series.css';

export default function Series() {
  // ❌ Removed broken hook
  const series = [];
  const isLoading = false;

  return (
    <div className="series-page fade-up">
      <div className="series-head">
        <h1 className="series-title display">SERIES</h1>
        <p className="series-sub">Active cricket series worldwide</p>
      </div>

      {isLoading && (
        <div className="series-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />
          ))}
        </div>
      )}

      {!isLoading && series.length === 0 && (
        <div className="series-empty">No series data available right now.</div>
      )}

      <div className="series-grid">
        {series.map((s, i) => (
          <div key={s.id || i} className="series-card fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
            <div className="series-card-name">{s.name}</div>

            <div className="series-card-meta">
              {s.startDate && (
                <span>
                  {new Date(s.startDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              )}

              {s.endDate && (
                <span>
                  → {new Date(s.endDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              )}
            </div>

            {s.odi || s.t20 || s.test ? (
              <div className="series-card-formats">
                {s.test > 0 && <span className="format-tag test">TEST {s.test}</span>}
                {s.odi > 0  && <span className="format-tag odi">ODI {s.odi}</span>}
                {s.t20 > 0  && <span className="format-tag t20">T20 {s.t20}</span>}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
