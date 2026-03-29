import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/onboard.css';

export default function Onboard() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  const handleAdvance = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => navigate('/tracks'), 480);
  };

  // Auto-advance after 4 seconds
  useEffect(() => {
    const timer = setTimeout(handleAdvance, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`onboard${exiting ? ' onboard--exiting' : ''}`}
      onClick={handleAdvance}
    >
      <div className="onboard__glow" />

      <div className="onboard__content">
        <h1 className="onboard__title">Morning Glory</h1>
        <p className="onboard__tagline">plant it in the dark. wake up in glory.</p>
      </div>

      <span className="onboard__enter">tap to enter</span>
    </div>
  );
}
