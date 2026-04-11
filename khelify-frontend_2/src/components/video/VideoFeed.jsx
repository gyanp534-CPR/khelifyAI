import { timeAgo } from '../../utils/cricket';
import './VideoFeed.css';

const CAT_LABELS = { highlight: 'Highlights', analysis: 'Analysis', reaction: 'Reaction' };
const CAT_COLORS = { highlight: 'var(--amber)', analysis: 'var(--blue)', reaction: 'var(--purple)' };

export default function VideoFeed({ videos, loading }) {
  if (loading) return <VideoSkeleton />;
  if (!videos) return null;

  const all = [
    ...(videos.highlights || []),
    ...(videos.analysis || []),
    ...(videos.reactions || []),
  ];

  if (all.length === 0) {
    return (
      <div className="video-feed">
        <VideoFeedHeader />
        <div className="vf-empty">No videos found yet. Check back after the match starts.</div>
      </div>
    );
  }

  return (
    <div className="video-feed fade-up fade-up-3">
      <VideoFeedHeader />

      {/* Highlights row */}
      {videos.highlights?.length > 0 && (
        <VideoSection title="Highlights" color="var(--amber)" videos={videos.highlights} />
      )}
      {videos.analysis?.length > 0 && (
        <VideoSection title="Analysis" color="var(--blue)" videos={videos.analysis} />
      )}
      {videos.reactions?.length > 0 && (
        <VideoSection title="Reactions" color="var(--purple)" videos={videos.reactions} />
      )}
    </div>
  );
}

function VideoFeedHeader() {
  return (
    <div className="vf-header">
      <div className="vf-header-left">
        <div className="vf-icon">▶</div>
        <span className="vf-title">Smart Video Feed</span>
      </div>
      <span className="vf-badge">YouTube</span>
    </div>
  );
}

function VideoSection({ title, color, videos }) {
  return (
    <div className="vf-section">
      <div className="vf-section-label" style={{ color }}>{title}</div>
      <div className="vf-scroll scroll-x">
        {videos.map(v => (
          <VideoCard key={v.videoId} video={v} color={color} />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ video, color }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="vc"
    >
      <div className="vc-thumb">
        {video.thumbnail
          ? <img src={video.thumbnail} alt={video.title} loading="lazy" />
          : <div className="vc-thumb-placeholder">🏏</div>
        }
        <div className="vc-play">
          <svg viewBox="0 0 12 14" fill="white" width="10" height="12">
            <path d="M1 1l10 6-10 6V1z" />
          </svg>
        </div>
        <div className="vc-cat-badge" style={{ color, borderColor: color }}>
          {CAT_LABELS[video.category] || video.category}
        </div>
      </div>
      <div className="vc-info">
        <div className="vc-title">{video.title}</div>
        <div className="vc-meta">
          <span>{video.channel}</span>
          {video.publishedAt && <span>· {timeAgo(video.publishedAt)}</span>}
        </div>
      </div>
    </a>
  );
}

function VideoSkeleton() {
  return (
    <div className="video-feed">
      <VideoFeedHeader />
      <div style={{ display: 'flex', gap: 10, padding: '10px 14px', overflow: 'hidden' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: '0 0 180px' }}>
            <div className="skeleton" style={{ height: 100, borderRadius: 8, marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 12, marginBottom: 4 }} />
            <div className="skeleton" style={{ height: 10, width: '60%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
