import React, { useState } from 'react';
import { Copy, Check, MessageSquare, Volume2 } from 'lucide-react';
import { formatTimeRange } from '../utils/transcriptHelpers';

export function TranscriptSegment({ segment, isInterim = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!segment?.text) return null;
    navigator.clipboard.writeText(segment.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInterim) {
    if (!segment?.text) return null;
    return (
      <div style={styles.interimCard}>
        <div style={styles.interimIconHolder}>
          <div style={styles.pulsingRedDot} />
        </div>
        <div style={styles.content}>
          <div style={styles.interimTag}>Live Interim Speech</div>
          <p style={styles.interimText}>{segment.text}</p>
        </div>
      </div>
    );
  }

  const timeLabel = formatTimeRange(segment.startTime, segment.endTime);

  return (
    <div className="feed-card">
      {/* 56px icon container with 10% opacity color background */}
      <div className="feed-icon-56">
        <Volume2 size={24} />
      </div>

      <div className="feed-content">
        <div style={styles.titleRow}>
          <span className="feed-title">{timeLabel ? `Segment (${timeLabel})` : 'Captured Speech'}</span>
        </div>
        <p className="feed-subtitle">{segment.text}</p>
      </div>

      {/* 40px circular trailing button that turns red on hover */}
      <button
        onClick={handleCopy}
        className="feed-action-btn-40"
        title="Copy segment text"
        aria-label="Copy segment"
      >
        {copied ? <Check size={18} color="#ffffff" /> : <Copy size={18} />}
      </button>
    </div>
  );
}

const styles = {
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  interimCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '24px',
    border: '1.5px dashed rgba(202, 0, 19, 0.35)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    boxShadow: '0 4px 16px rgba(23, 30, 25, 0.04)'
  },
  interimIconHolder: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    backgroundColor: 'rgba(202, 0, 19, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  pulsingRedDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ca0013',
    boxShadow: '0 0 8px rgba(202, 0, 19, 0.7)',
    animation: 'pulse-interim 1.2s infinite ease-in-out'
  },
  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  interimTag: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#ca0013',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  },
  interimText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#171e19',
    fontStyle: 'italic',
    lineHeight: '1.4'
  }
};
