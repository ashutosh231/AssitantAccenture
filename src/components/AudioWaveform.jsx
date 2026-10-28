import React from 'react';
import { Mic, Pause, AlertCircle, WifiOff } from 'lucide-react';
import { formatDuration } from '../utils/transcriptHelpers';

export function AudioWaveform({ listeningStatus, audioLevel, sessionDuration }) {
  const isListening = listeningStatus === 'listening';
  const isPaused = listeningStatus === 'paused';
  const isConnecting = listeningStatus === 'connecting';
  const isError = listeningStatus === 'error';

  // Extract 24 frequency bars
  const bars = Array.from({ length: 24 }).map((_, i) => {
    if (!isListening) return 4;
    const freq = audioLevel?.frequencyData?.[i] || 0;
    return Math.max(4, Math.min(32, Math.round((freq / 255) * 32)));
  });

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        {/* Status Pill */}
        <div
          style={{
            ...styles.statusPill,
            backgroundColor: isListening
              ? 'rgba(202, 0, 19, 0.08)'
              : 'rgba(183, 198, 194, 0.2)',
            borderColor: isListening
              ? 'rgba(202, 0, 19, 0.25)'
              : 'rgba(183, 198, 194, 0.3)'
          }}
        >
          {isListening && <div style={styles.pulseDot} />}
          {isPaused && <Pause size={11} color="#ca0013" />}
          {isConnecting && <div style={styles.connectingDot} />}
          {isError && <AlertCircle size={11} color="#ca0013" />}
          {!isListening && !isPaused && !isConnecting && !isError && (
            <WifiOff size={11} color="#7b8a86" />
          )}

          <span
            style={{
              ...styles.statusText,
              color: isListening ? '#ca0013' : '#576561'
            }}
          >
            {isListening
              ? 'LIVE LISTENING'
              : isPaused
              ? 'SESSION PAUSED'
              : isConnecting
              ? 'CONNECTING TO AWS...'
              : isError
              ? 'MIC ERROR'
              : 'READY TO LISTEN'}
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
                ? idx % 2 === 0
                  ? '#ca0013'
                  : '#171e19'
                : '#b7c6c2'
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '12px 14px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    border: '1px solid rgba(183, 198, 194, 0.25)',
    boxShadow: '0 4px 16px rgba(23, 30, 25, 0.04)',
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
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '9999px',
    border: '1px solid'
  },
  pulseDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#ca0013',
    boxShadow: '0 0 6px rgba(202, 0, 19, 0.6)'
  },
  connectingDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#576561'
  },
  statusText: {
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.8px',
    textTransform: 'uppercase'
  },
  timerWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px'
  },
  timerLabel: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#7b8a86',
    letterSpacing: '0.8px'
  },
  timerValue: {
    fontSize: '13px',
    fontWeight: '900',
    color: '#171e19',
    fontVariantNumeric: 'tabular-nums'
  },
  waveformTrack: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '36px',
    padding: '0 4px',
    backgroundColor: 'rgba(238, 235, 227, 0.5)',
    borderRadius: '14px'
  },
  waveBar: {
    width: '4.5px',
    borderRadius: '3px',
    transition: 'height 0.08s ease, background-color 0.2s ease'
  }
};
