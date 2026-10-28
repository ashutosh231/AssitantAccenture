import React from 'react';
import { Mic, Pause, AlertCircle, WifiOff } from 'lucide-react';
import { formatDuration } from '../utils/transcriptHelpers';

export function AudioWaveform({ listeningStatus, audioLevel, sessionDuration }) {
  const isListening = listeningStatus === 'listening';
  const isPaused = listeningStatus === 'paused';
  const isConnecting = listeningStatus === 'connecting';
  const isError = listeningStatus === 'error';

  // Extract 24 frequency bars for display
  const bars = Array.from({ length: 24 }).map((_, i) => {
    if (!isListening) return 4;
    const freq = audioLevel?.frequencyData?.[i] || 0;
    // Map 0-255 to height 4px - 38px
    const dynamicHeight = Math.max(4, Math.min(38, Math.round((freq / 255) * 38)));
    return dynamicHeight;
  });

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        {/* Status Pill */}
        <div
          style={{
            ...styles.statusPill,
            borderColor: isListening
              ? 'rgba(16, 185, 129, 0.4)'
              : isPaused
              ? 'rgba(245, 158, 11, 0.4)'
              : isError
              ? 'rgba(239, 68, 68, 0.4)'
              : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {isListening && <div className="badge-live-pulse" />}
          {isPaused && <Pause size={12} color="#f59e0b" />}
          {isConnecting && <div style={styles.connectingDot} />}
          {isError && <AlertCircle size={12} color="#ef4444" />}
          {!isListening && !isPaused && !isConnecting && !isError && <WifiOff size={12} color="#64748b" />}

          <span
            style={{
              ...styles.statusText,
              color: isListening
                ? '#34d399'
                : isPaused
                ? '#fbbf24'
                : isError
                ? '#f87171'
                : '#94a3b8'
            }}
          >
            {isListening
              ? 'LISTENING TO LAPTOP'
              : isPaused
              ? 'PAUSED'
              : isConnecting
              ? 'CONNECTING TO AWS...'
              : isError
              ? 'AUDIO ERROR'
              : 'STANDBY'}
          </span>
        </div>

        {/* Session Timer */}
        <div style={styles.timerWrapper}>
          <span style={styles.timerLabel}>SESSION</span>
          <span style={styles.timerValue}>{formatDuration(sessionDuration)}</span>
        </div>
      </div>

      {/* Waveform Bars Container */}
      <div style={styles.waveformTrack}>
        {bars.map((height, idx) => (
          <div
            key={idx}
            style={{
              ...styles.waveBar,
              height: `${height}px`,
              backgroundColor: isListening
                ? `rgba(96, 165, 250, ${0.4 + (height / 38) * 0.6})`
                : isPaused
                ? '#f59e0b44'
                : 'rgba(255, 255, 255, 0.08)'
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '12px 16px',
    backgroundColor: '#0c1322',
    borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  connectingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#38bdf8'
  },
  statusText: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.4px'
  },
  timerWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px'
  },
  timerLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: '0.5px'
  },
  timerValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#f8fafc',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.5px'
  },
  waveformTrack: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '42px',
    padding: '0 4px',
    backgroundColor: 'rgba(5, 10, 20, 0.6)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  waveBar: {
    width: '6px',
    borderRadius: '3px',
    transition: 'height 0.08s ease, background-color 0.2s ease'
  }
};

