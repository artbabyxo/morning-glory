import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DollarIcon from '../components/icons/DollarIcon';
import StarIcon from '../components/icons/StarIcon';
import '../styles/player.css';

const TRACK_DATA = {
  1: {
    name: 'Confidence & Belonging',
    hz: '396 Hz',
    icon: <StarIcon />,
    audioSrc: '/audio/track-1-confidence.mp3',
  },
  3: {
    name: 'Abundance',
    hz: '432 Hz',
    icon: <DollarIcon />,
    audioSrc: '/audio/track-3-abundance.mp3',
  },
};

const DURATIONS = {
  10: 10 * 60,
  30: 30 * 60,
};

const LOOP_FADE_SECS = 3;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="play-icon">
    <polygon points="6,4 20,12 6,20" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="7" y1="4" x2="7" y2="20" />
    <line x1="17" y1="4" x2="17" y2="20" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

export default function Player() {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const track = TRACK_DATA[trackId];

  const [selectedDuration, setSelectedDuration] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATIONS[30]);
  const [isFading, setIsFading] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const fadeRef = useRef(null);
  const loopFadeRef = useRef(null);

  // Refs to avoid stale closures in audio event listeners
  const isPlayingRef = useRef(false);
  const isFadingRef = useRef(false);
  const loopFadingRef = useRef(false);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isFadingRef.current = isFading; }, [isFading]);

  const fadeInAudio = useCallback((audio) => {
    clearInterval(loopFadeRef.current);
    loopFadingRef.current = true;
    audio.volume = 0;
    const steps = 30;
    const interval = (LOOP_FADE_SECS * 1000) / steps;
    const step = 1 / steps;
    loopFadeRef.current = setInterval(() => {
      if (audio.volume < 1 - step) {
        audio.volume = Math.min(1, audio.volume + step);
      } else {
        audio.volume = 1;
        loopFadingRef.current = false;
        clearInterval(loopFadeRef.current);
      }
    }, interval);
  }, []);

  // Init audio element
  useEffect(() => {
    const audio = new Audio(track.audioSrc);
    audio.loop = false;
    audio.preload = 'auto';

    const handleTimeUpdate = () => {
      if (!isPlayingRef.current || isFadingRef.current || loopFadingRef.current) return;
      if (!audio.duration) return;
      const timeToEnd = audio.duration - audio.currentTime;
      if (timeToEnd <= LOOP_FADE_SECS && timeToEnd > 0) {
        loopFadingRef.current = true;
        clearInterval(loopFadeRef.current);
        const steps = 20;
        const interval = (timeToEnd * 1000) / steps;
        const startVol = audio.volume;
        const step = startVol / steps;
        loopFadeRef.current = setInterval(() => {
          if (audio.volume > step) {
            audio.volume = Math.max(0, audio.volume - step);
          } else {
            audio.volume = 0;
            clearInterval(loopFadeRef.current);
          }
        }, interval);
      }
    };

    const handleEnded = () => {
      if (isFadingRef.current) return; // session ending, don't restart
      clearInterval(loopFadeRef.current);
      loopFadingRef.current = false;
      audio.currentTime = 0;
      audio.play().catch(console.error);
      fadeInAudio(audio);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
      clearInterval(timerRef.current);
      clearInterval(fadeRef.current);
      clearInterval(loopFadeRef.current);
    };
  }, [track.audioSrc, fadeInAudio]);

  useEffect(() => {
    if (!isPlaying) {
      setTimeLeft(DURATIONS[selectedDuration]);
    }
  }, [selectedDuration, isPlaying]);

  const stopAndReset = useCallback(() => {
    const audio = audioRef.current;
    clearInterval(timerRef.current);
    clearInterval(fadeRef.current);
    clearInterval(loopFadeRef.current);
    loopFadingRef.current = false;
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
    isFadingRef.current = true;
    setIsFading(true);
    clearInterval(timerRef.current);
    clearInterval(loopFadeRef.current);
    loopFadingRef.current = false;

    const fadeDuration = 10000;
    const steps = 50;
    const interval = fadeDuration / steps;
    const startVol = audio.volume > 0 ? audio.volume : 1;
    audio.volume = startVol;
    const volumeStep = startVol / steps;

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
      audio.pause();
      clearInterval(timerRef.current);
      clearInterval(fadeRef.current);
      clearInterval(loopFadeRef.current);
      loopFadingRef.current = false;
      setIsPlaying(false);
      setIsFading(false);
    } else {
      audio.play().catch(console.error);
      fadeInAudio(audio);
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
  }, [isPlaying, startFadeOut, fadeInAudio]);

  const handleDurationChange = (mins) => {
    if (isPlaying) return;
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
        <div className="player__icon-wrap">
          <div className={`player__icon-glow${isPlaying ? ' player__icon-glow--active' : ''}`} />
          <div className="player__icon">
            {track.icon}
          </div>
        </div>

        <h1 className="player__track-name">{track.name}</h1>
        <p className="player__track-hz">{track.hz}</p>

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

        <div className={`player__timer${showReadyState ? ' player__timer--dim' : ''}`}>
          {formatTime(timeLeft)}
        </div>

        <button
          className="player__play-btn"
          onClick={handlePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <p className="player__status">
          {isFading ? 'fading out...' : isPlaying ? 'playing' : ''}
        </p>
      </div>
    </div>
  );
}
