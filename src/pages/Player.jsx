import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DollarIcon from '../components/icons/DollarIcon';
import '../styles/player.css';

const TRACK_DATA = {
  3: {
    name: 'Abundance',
    hz: '432 Hz',
    icon: <DollarIcon />,
    audioSrc: '/audio/track-3-abundance.m4a',
  },
};

const DURATIONS = {
  10: 10 * 60,
  30: 30 * 60,
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Play icon SVG
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="play-icon">
    <polygon points="6,4 20,12 6,20" />
  </svg>
);

// Pause icon SVG
const PauseIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="7" y1="4" x2="7" y2="20" />
    <line x1="17" y1="4" x2="17" y2="20" />
  </svg>
);

// Back chevron
const BackIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

export default function Player() {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const track = TRACK_DATA[trackId];

  const [selectedDuration, setSelectedDuration] = useState(30); // minutes
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATIONS[30]);
  const [isFading, setIsFading] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const fadeRef = useRef(null);

  // Init audio element
  useEffect(() => {
    const audio = new Audio(track.audioSrc);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      clearInterval(timerRef.current);
      clearInterval(fadeRef.current);
    };
  }, [track.audioSrc]);

  // When duration selection changes while not playing, reset timer
  useEffect(() => {
    if (!isPlaying) {
      setTimeLeft(DURATIONS[selectedDuration]);
    }
  }, [selectedDuration, isPlaying]);

  const stopAndReset = useCallback(() => {
    const audio = audioRef.current;
    clearInterval(timerRef.current);
    clearInterval(fadeRef.current);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
    }
    setIsPlaying(false);
    setIsFading(false);
    setTimeLeft(DURATIONS[selectedDuration]);
  }, [selectedDuration]);

  const startFadeOut = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsFading(true);
    clearInterval(timerRef.current);

    const fadeDuration = 10000; // 10s
    const steps = 50;
    const interval = fadeDuration / steps;
    const volumeStep = audio.volume / steps;

    fadeRef.current = setInterval(() => {
      if (audio.volume > volumeStep) {
        audio.volume = Math.max(0, audio.volume - volumeStep);
      } else {
        clearInterval(fadeRef.current);
        stopAndReset();
      }
    }, interval);
  }, [stopAndReset]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Pause
      audio.pause();
      clearInterval(timerRef.current);
      clearInterval(fadeRef.current);
      setIsPlaying(false);
      setIsFading(false);
    } else {
      // Resume/start
      audio.volume = 1;
      audio.play().catch(console.error);
      setIsPlaying(true);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            startFadeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isPlaying, startFadeOut]);

  const handleDurationChange = (mins) => {
    if (isPlaying) return; // don't allow change while playing
    setSelectedDuration(mins);
  };

  const handleBack = () => {
    stopAndReset();
    navigate('/tracks');
  };

  if (!track) {
    return (
      <div className="player">
        <div className="player__header">
          <button className="player__back" onClick={() => navigate('/tracks')}>
            <BackIcon /> Back
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Track not found.
        </div>
      </div>
    );
  }

  const showReadyState = !isPlaying && timeLeft === DURATIONS[selectedDuration];

  return (
    <div className="player">
      <header className="player__header">
        <button className="player__back" onClick={handleBack}>
          <BackIcon />
          Back
        </button>
      </header>

      <div className="player__body">
        {/* Icon with glow */}
        <div className="player__icon-wrap">
          <div className={`player__icon-glow${isPlaying ? ' player__icon-glow--active' : ''}`} />
          <div className="player__icon">
            {track.icon}
          </div>
        </div>

        {/* Track info */}
        <h1 className="player__track-name">{track.name}</h1>
        <p className="player__track-hz">{track.hz}</p>

        {/* Duration toggles */}
        <div className="player__duration-row">
          {[10, 30].map((mins) => (
            <button
              key={mins}
              className={`player__duration-btn${selectedDuration === mins ? ' player__duration-btn--active' : ''}`}
              onClick={() => handleDurationChange(mins)}
              disabled={isPlaying}
            >
              {mins} min
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className={`player__timer${showReadyState ? ' player__timer--dim' : ''}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Play/Pause */}
        <button
          className="player__play-btn"
          onClick={handlePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Status label */}
        <p className="player__status">
          {isFading ? 'fading out...' : isPlaying ? 'playing' : ''}
        </p>
      </div>
    </div>
  );
}
