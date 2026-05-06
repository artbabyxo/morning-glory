import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Onboard from './pages/Onboard';
import Tracks from './pages/Tracks';
import Player from './pages/Player';
import FullGlory from './pages/FullGlory';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { requestNotificationPermissions, cancelAlarm } from './hooks/useAlarm';

export default function App() {
  useEffect(() => {
    let listenerHandle = null;

    async function init() {
      if (!Capacitor.isNativePlatform()) return;
      await requestNotificationPermissions();
      listenerHandle = await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        () => { cancelAlarm(); }
      );
    }

    init();

    return () => {
      if (listenerHandle) listenerHandle.remove();
    };
  }, []);

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
