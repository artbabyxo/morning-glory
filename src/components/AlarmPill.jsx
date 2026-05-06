import { useState } from 'react';
import { useAlarm } from '../hooks/useAlarm';

export default function AlarmPill() {
  const { alarmTime, displayTime, setAlarm, clearAlarm } = useAlarm();
  const [modalOpen, setModalOpen] = useState(false);
  // Local state for the time picker — initialise to current alarm or empty
  const [pickerValue, setPickerValue] = useState(alarmTime || '');
  const [permError, setPermError] = useState(false);

  function openModal() {
    setPickerValue(alarmTime || '');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleConfirm() {
    if (!pickerValue) return;
    const result = await setAlarm(pickerValue);
    if (result && !result.ok && result.reason === 'permission-denied') {
      setPermError(true);
      return;
    }
    setPermError(false);
    closeModal();
  }

  async function handleCancel() {
    await clearAlarm();
    closeModal();
  }

  return (
    <>
      {/* Pill */}
      <button
        className={`alarm-pill ${alarmTime ? 'alarm-pill--active' : ''}`}
        onClick={openModal}
        aria-label={alarmTime ? `Alarm set for ${displayTime}. Tap to change.` : 'Set wake alarm'}
      >
        <span className="alarm-pill__icon">
          {/* minimal crescent/moon icon inline */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="alarm-pill__label">
          {alarmTime ? `Wake at ${displayTime}` : 'Wake at --:--'}
        </span>
      </button>

      {/* Modal overlay */}
      {modalOpen && (
        <div className="alarm-modal-overlay" onClick={closeModal}>
          <div
            className="alarm-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Set wake alarm"
          >
            <h2 className="alarm-modal__title">Wake alarm</h2>
            <p className="alarm-modal__sub">Plays a subliminal morning clip</p>

            {permError && (
              <p style={{ color: '#e07', fontSize: '13px', margin: '0 0 12px', textAlign: 'center' }}>
                Notifications are off. Go to Settings &gt; Morning Glory &gt; Notifications to enable the alarm.
              </p>
            )}

            <input
              className="alarm-modal__timepicker"
              type="time"
              value={pickerValue}
              onChange={(e) => setPickerValue(e.target.value)}
            />

            <button
              className="alarm-modal__confirm"
              onClick={handleConfirm}
              disabled={!pickerValue}
            >
              Set Alarm
            </button>

            {alarmTime && (
              <button className="alarm-modal__cancel-alarm" onClick={handleCancel}>
                Cancel alarm
              </button>
            )}

            <button className="alarm-modal__dismiss" onClick={closeModal}>
              dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
