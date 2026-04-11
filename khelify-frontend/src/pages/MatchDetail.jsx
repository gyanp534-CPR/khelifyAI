import { useParams, Link } from 'react-router-dom';
import { useMatch } from '../hooks/useData';
import ScoreHero from '../components/match/ScoreHero';
import AIInsights from '../components/match/AIInsights';
import VideoFeed from '../components/video/VideoFeed';
import Scorecard from '../components/match/Scorecard';
import './MatchDetail.css';

export default function MatchDetail() {
  const { id } = useParams();

  const { data: matchData, isLoading, isError } = useMatch(id);

  // 🚫 REMOVE broken video hook
  const videos = [];
  const videosLoading = false;

  if (isLoading) {
    return <div className="match-error">Loading match...</div>;
  }

  if (isError || !matchData?.match) {
    return (
      <div className="match-error">
        <div className="me-icon">⚠</div>
        <div className="me-text">
          Could not load match. It may have ended or the ID is invalid.
        </div>
        <Link to="/" className="me-back">← Back to matches</Link>
      </div>
    );
  }

  const match = matchData.match;

  return (
    <div className="match-detail fade-up">
      <Link to="/" className="md-back">← All matches</Link>

      <div className="md-layout">
        {/* LEFT */}
        <div className="md-main">
          <ScoreHero match={match} />

          <AIInsights
  ai={match.ai}
  loading={false}
/>

          <Scorecard
            scorecard={matchData?.scorecard}
            loading={false}
          />
        </div>

        {/* RIGHT */}
        <div className="md-side">
          <VideoFeed
            videos={videos}
            loading={videosLoading}
          />

          {match && (
            <div className="md-meta-card">
              <div className="md-meta-title">Match Info</div>

              <div className="md-meta-row">
                <span>Format</span>
                <span>{(match.matchType || 'ODI').toUpperCase()}</span>
              </div>

              {match.venue && (
                <div className="md-meta-row">
                  <span>Venue</span>
                  <span>{match.venue}</span>
                </div>
              )}

              {match.date && (
                <div className="md-meta-row">
                  <span>Date</span>
                  <span>
                    {new Date(match.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
