import { useNavigate } from 'react-router-dom';

const LockIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11 V7 C8 4.8 10 3 12 3 C14 3 16 4.8 16 7 V11" />
  </svg>
);

export default function TrackCard({ track }) {
  const navigate = useNavigate();
  const isLive = track.status === 'live';

  const handleClick = () => {
    if (isLive) navigate(`/player/${track.id}`);
  };

  return (
    <div
      className={`track-card ${isLive ? 'track-card--live' : 'track-card--locked'}`}
      onClick={handleClick}
      role={isLive ? 'button' : undefined}
      tabIndex={isLive ? 0 : undefined}
      onKeyDown={isLive ? (e) => e.key === 'Enter' && handleClick() : undefined}
    >
      {isLive ? (
        <span className="track-card__live-badge">Live</span>
      ) : (
        <span className="track-card__lock">
          <LockIcon />
        </span>
      )}

      <div className="track-card__icon">
        {track.icon}
      </div>

      <div className="track-card__name">{track.name}</div>
    </div>
  );
}
