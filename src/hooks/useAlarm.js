import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mg_alarm_time';

// Only import LocalNotifications in a Capacitor (native) context.
// On web, the Capacitor bridge is absent, so we gracefully no-op.
async function getLocalNotifications() {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    return LocalNotifications;
  } catch {
    return null;
  }
}

export async function requestNotificationPermissions() {
  const LN = await getLocalNotifications();
  if (!LN) return false;
  try {
    const result = await LN.requestPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

export async function checkNotificationPermissions() {
  const LN = await getLocalNotifications();
  if (!LN) return false;
  try {
    const result = await LN.checkPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

const ALARM_IDS = [1, 2, 3, 4, 5];
const SNOOZE_INTERVAL_MS = 9 * 60 * 1000;

export async function scheduleAlarm(alarmDate) {
  const LN = await getLocalNotifications();
  if (!LN) return { ok: false, reason: 'not-available' };
  try {
    const { display } = await LN.checkPermissions();
    if (display !== 'granted') {
      return { ok: false, reason: 'permission-denied' };
    }
    await LN.cancel({ notifications: ALARM_IDS.map(id => ({ id })) });
    await LN.schedule({
      notifications: ALARM_IDS.map((id, i) => ({
        id,
        title: 'Good morning.',
        body: i === 0 ? 'Rise in glory.' : "Still here. Rise when you're ready.",
        schedule: { at: new Date(alarmDate.getTime() + i * SNOOZE_INTERVAL_MS), allowWhileIdle: true },
        sound: 'alarm-confidence.caf',
        actionTypeId: '',
        extra: null,
      })),
    });
    return { ok: true };
  } catch (err) {
    console.warn('[Morning Glory] Could not schedule alarm:', err);
    return { ok: false, reason: err?.message };
  }
}

export async function cancelAlarm() {
  const LN = await getLocalNotifications();
  if (!LN) return;
  try {
    await LN.cancel({ notifications: ALARM_IDS.map(id => ({ id })) });
  } catch {
    // no-op
  }
}

// Returns the next occurrence of a given HH:MM time as a Date object.
// If that time has already passed today, returns tomorrow's occurrence.
function nextOccurrence(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(hours, minutes, 0, 0);
  if (candidate <= now) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
}

export function useAlarm() {
  // alarmTime stored as "HH:MM" string (24-hour), or null
  const [alarmTime, setAlarmTime] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });

  // On mount: if there's a saved alarm, reschedule it (handles app restarts)
  useEffect(() => {
    if (alarmTime) {
      const alarmDate = nextOccurrence(alarmTime);
      scheduleAlarm(alarmDate);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setAlarm = useCallback(async (timeString) => {
    const alarmDate = nextOccurrence(timeString);
    localStorage.setItem(STORAGE_KEY, timeString);
    setAlarmTime(timeString);
    const result = await scheduleAlarm(alarmDate);
    return result;
  }, []);

  const clearAlarm = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setAlarmTime(null);
    await cancelAlarm();
  }, []);

  // Formatted display string, e.g. "7:00 AM"
  const displayTime = alarmTime
    ? (() => {
        const [h, m] = alarmTime.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        const min = String(m).padStart(2, '0');
        return `${hour}:${min} ${suffix}`;
      })()
    : null;

  return { alarmTime, displayTime, setAlarm, clearAlarm };
}
