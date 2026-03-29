import TrackCard from '../components/TrackCard';
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
    status: 'locked',
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
  return (
    <div className="tracks">
      <header className="tracks__header">
        <h1 className="tracks__title">Morning Glory</h1>
        <p className="tracks__subtitle">choose your frequency</p>
      </header>

      <div className="tracks__grid">
        {TRACKS.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}
