import { useParams, Link } from 'react-router-dom';
import { useMatch, useAnalysis, useMatchVideos } from '../hooks/useData';
import ScoreHero from '../components/match/ScoreHero';
import AIInsights from '../components/match/AIInsights';
import VideoFeed from '../components/video/VideoFeed';
import Scorecard from '../components/match/Scorecard';
import { getTeamShort } from '../utils/cricket';
import './MatchDetail.css';

export default function MatchDetail() {
  const { id } = useParams();
  const { data: matchData } = useMatch(id);
const matchLoading = false;
const isError = !matchData?.match;
  const analysisData = null;
const analysisLoading = false;

  if (!matchData?.match) {
  return (
    <div className="match-error">
      <div className="me-icon">⚠</div>
      <div className="me-text">Match data unavailable</div>
      <Link to="/" className="me-back">← Back</Link>
    </div>
  );
}

  const match   = matchData?.match;
  const team1   = match?.teamInfo?.[0]?.name || match?.teams?.[0] || '';
  const team2   = match?.teamInfo?.[1]?.name || match?.teams?.[1] || '';
  const tournament = match?.series_id || '';

  const { data: videos, isLoading: videosLoading } = useMatchVideos(team1, team2, tournament);

  if (isError) {
    return (
      <div className="match-error">
        <div className="me-icon">⚠</div>
        <div className="me-text">Could not load match. It may have ended or the ID is invalid.</div>
        <Link to="/" className="me-back">← Back to matches</Link>
      </div>
    );
  }

  return (
    <div className="match-detail fade-up">
      {/* Back nav */}
      <Link to="/" className="md-back">← All matches</Link>

      {/* Main 2-col layout */}
      <div className="md-layout">
        {/* Left column - score + analysis */}
        <div className="md-main">
          <ScoreHero match={match} />

          <AIInsights
            analysis={analysisData}
            loading={analysisLoading && !analysisData}
          />

          <Scorecard
            scorecard={matchData?.scorecard}
            loading={matchLoading}
          />
        </div>

        {/* Right column - videos */}
        <div className="md-side">
          <VideoFeed
            videos={matchData?.videos || videos}
            loading={videosLoading && !matchData?.videos}
          />

          {/* Match meta card */}
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
                  <span>{new Date(match.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
