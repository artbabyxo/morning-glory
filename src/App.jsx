import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Onboard from './pages/Onboard';
import Tracks from './pages/Tracks';
import Player from './pages/Player';
import FullGlory from './pages/FullGlory';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboard />} />
        <Route path="/tracks" element={<Tracks />} />
        <Route path="/player/:trackId" element={<Player />} />
        <Route path="/journey" element={<FullGlory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
