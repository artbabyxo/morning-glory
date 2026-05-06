import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const STORAGE_KEY = 'mg_alarm_time';
const isNative = Capacitor.isNativePlatform();

export async function requestNotificationPermissions() {
  if (!isNative) return false;
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (err) {
    console.warn('[MG] requestPermissions failed:', err);
    return false;
  }
}

export async function checkNotificationPermissions() {
  if (!isNative) return false;
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

const ALARM_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SNOOZE_INTERVAL_MS = 30 * 1000; // every 30 sec, 10 times = 5 min

export async function scheduleAlarm(alarmDate) {
  if (!isNative) return { ok: false, reason: 'not-available' };
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      return { ok: false, reason: 'permission-denied' };
    }
    await LocalNotifications.cancel({ notifications: ALARM_IDS.map(id => ({ id })) });
    await LocalNotifications.schedule({
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
    console.warn('[MG] Could not schedule alarm:', err);
    return { ok: false, reason: err?.message };
  }
}

export async function cancelAlarm() {
  if (!isNative) return;
  try {
    await LocalNotifications.cancel({ notifications: ALARM_IDS.map(id => ({ id })) });
  } catch {
    // no-op
  }
}

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
  const [alarmTime, setAlarmTime] = useState(() => localStorage.getItem(STORAGE_KEY) || null);

  useEffect(() => {
    if (alarmTime) {
      scheduleAlarm(nextOccurrence(alarmTime));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setAlarm = useCallback(async (timeString) => {
    localStorage.setItem(STORAGE_KEY, timeString);
    setAlarmTime(timeString);
    const result = await scheduleAlarm(nextOccurrence(timeString));
    return result;
  }, []);

  const clearAlarm = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setAlarmTime(null);
    await cancelAlarm();
  }, []);

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
