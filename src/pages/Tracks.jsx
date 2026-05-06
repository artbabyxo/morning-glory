import { useNavigate } from 'react-router-dom';
import TrackCard from '../components/TrackCard';
import AlarmPill from '../components/AlarmPill';
import StarIcon from '../components/icons/StarIcon';
import RoseIcon from '../components/icons/RoseIcon';
import DollarIcon from '../components/icons/DollarIcon';
import HeartIcon from '../components/icons/HeartIcon';
import '../styles/tracks.css';

const TRACKS = [
  {
    id: 1,
    name: 'Confidence & Belonging',
    hz: '396 Hz',
    icon: <StarIcon />,
    status: 'live',
  },
  {
    id: 2,
    name: 'Physical Glow Up',
    hz: '528 Hz',
    icon: <RoseIcon />,
    status: 'locked',
  },
  {
    id: 3,
    name: 'Abundance',
    hz: '432 Hz',
    icon: <DollarIcon />,
    status: 'live',
  },
  {
    id: 4,
    name: 'Immune Support',
    hz: '741 Hz',
    icon: <HeartIcon />,
    status: 'locked',
  },
];

export default function Tracks() {
  const navigate = useNavigate();

  return (
    <div className="tracks">
      <header className="tracks__header">
        <h1 className="tracks__title">Morning Glory</h1>
        <p className="tracks__subtitle">subliminal reprogramming while you sleep</p>
        <p className="tracks__subtitle tracks__subtitle--secondary">solfeggio frequencies for nervous system regulation + deeper subconscious integration</p>
      </header>

      <div className="tracks__grid">
        {TRACKS.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>

      <div className="tracks__journey-wrap">
        <button className="tracks__full-glory" onClick={() => navigate('/journey')}>
          Full Glory
        </button>
        <p className="tracks__journey-sub">all tracks · 30 min · sequential</p>
      </div>

      <div className="tracks__alarm-wrap">
        <AlarmPill />
        <p className="tracks__alarm-note">requires ringer on · for do not disturb, go to settings &gt; focus &gt; allow morning glory</p>
      </div>
    </div>
  );
}
