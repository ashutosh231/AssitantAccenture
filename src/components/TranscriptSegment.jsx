import React, { useState } from 'react';
import { Copy, Check, Clock } from 'lucide-react';
import { formatTimeRange } from '../utils/transcriptHelpers';

export function TranscriptSegment({ segment, isInterim = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!segment?.text) return;
    navigator.clipboard.writeText(segment.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInterim) {
    if (!segment?.text) return null;
    return (
      <div style={styles.interimCard}>
        <div style={styles.interimHeader}>
          <span style={styles.interimPill}>
            <span style={styles.pulsingDot} />
            Live Interim
          </span>
        </div>
        <p style={styles.interimText}>{segment.text}</p>
      </div>
    );
  }

  const timeLabel = formatTimeRange(segment.startTime, segment.endTime);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.metaInfo}>
          {timeLabel && (
            <span style={styles.timestamp}>
              <Clock size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
              {timeLabel}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          style={styles.copyBtn}
          title="Copy segment text"
          aria-label="Copy segment"
        >
          {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} color="#64748b" />}
        </button>
      </div>
      <p style={styles.text}>{segment.text}</p>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '12px 14px',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    transition: 'border-color 0.2s ease'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  metaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  timestamp: {
    fontSize: '10.5px',
    fontWeight: '600',
    color: '#60a5fa',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    padding: '2px 7px',
    borderRadius: '4px',
    fontVariantNumeric: 'tabular-nums'
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: '14.5px',
    lineHeight: '1.55',
    color: '#f1f5f9',
    userSelect: 'text',
    wordBreak: 'break-word'
  },
  interimCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '12px',
    padding: '12px 14px',
    border: '1px dashed rgba(96, 165, 250, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  interimHeader: {
    display: 'flex',
    alignItems: 'center'
  },
  interimPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  pulsingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#38bdf8',
    boxShadow: '0 0 6px #38bdf8'
  },
  interimText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#93c5fd',
    fontStyle: 'italic',
    userSelect: 'text',
    wordBreak: 'break-word'
  }
};

