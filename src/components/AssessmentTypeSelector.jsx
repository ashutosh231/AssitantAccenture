import React from 'react';
import {
  MessageSquareText,
  Brain,
  BookOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  Mic,
  Mail
} from 'lucide-react';
import { ASSESSMENT_TYPES } from '../services/bedrockService';

const ICON_MAP = {
  MessageSquareText,
  Brain,
  BookOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  Mic,
  Mail
};

export function AssessmentTypeSelector({ selectedType, onSelectType }) {
  const current = ASSESSMENT_TYPES.find((t) => t.id === selectedType) || ASSESSMENT_TYPES[0];

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.label}>ASSESSMENT TYPE</span>
        <span style={styles.activeTag}>{current.tag}</span>
      </div>

      {/* Horizontal scrolling pill row */}
      <div style={styles.scrollStrip}>
        {ASSESSMENT_TYPES.map((type) => {
          const isSelected = type.id === selectedType;
          const IconComp = ICON_MAP[type.icon] || Sparkles;

          return (
            <button
              key={type.id}
              onClick={() => onSelectType(type.id)}
              style={{
                ...styles.pillBtn,
                backgroundColor: isSelected ? '#8b5cf6' : '#141e33',
                borderColor: isSelected ? '#a855f7' : 'rgba(255, 255, 255, 0.08)',
                color: isSelected ? '#ffffff' : '#94a3b8'
              }}
            >
              <IconComp size={13} color={isSelected ? '#ffffff' : '#64748b'} />
              <span>{type.title}</span>
            </button>
          );
        })}
      </div>

      {/* Brief instruction tip */}
      <div style={styles.descBox}>
        <p style={styles.descText}>{current.shortDesc}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 14px',
    backgroundColor: '#0c1322',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.6px'
  },
  activeTag: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#c084fc',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  scrollStrip: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '4px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  pillBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0
  },
  descBox: {
    padding: '6px 10px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  descText: {
    fontSize: '11.5px',
    color: '#cbd5e1',
    lineHeight: '1.4'
  }
};

