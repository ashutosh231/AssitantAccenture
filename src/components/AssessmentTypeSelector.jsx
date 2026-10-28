import React from 'react';
import {
  MessageSquareText,
  Brain,
  BookOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  Mic
} from 'lucide-react';
import { ASSESSMENT_TYPES } from '../services/bedrockService';

const ICON_MAP = {
  MessageSquareText,
  Brain,
  BookOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  Mic
};

export function AssessmentTypeSelector({ selectedType, onSelectType }) {
  const current = ASSESSMENT_TYPES.find((t) => t.id === selectedType) || ASSESSMENT_TYPES[0];

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.label}>ASSESSMENT CATEGORY</span>
        <span style={styles.categoryCount}>7 Sections Available</span>
      </div>

      {/* Horizontal snap-scrolling list of category buttons */}
      <div style={styles.scrollStrip}>
        {ASSESSMENT_TYPES.map((type) => {
          const isSelected = type.id === selectedType;
          const IconComp = ICON_MAP[type.icon] || Sparkles;

          if (isSelected) {
            // Active state: 160px+ wide pill in #171e19, internal 40px red circle for icon, white text
            return (
              <button
                key={type.id}
                onClick={() => onSelectType(type.id)}
                style={styles.activePill}
                title={type.title}
              >
                <div style={styles.activeRedCircle}>
                  <IconComp size={18} color="#ffffff" />
                </div>
                <div style={styles.activeTextGroup}>
                  <span style={styles.activeTitle}>{type.title}</span>
                  <span style={styles.activeSub}>{type.tag}</span>
                </div>
              </button>
            );
          }

          // Inactive state: 56x56px white square with 16px radius, #b7c6c2/30 border
          return (
            <button
              key={type.id}
              onClick={() => onSelectType(type.id)}
              style={styles.inactiveSquare}
              title={type.title}
            >
              <IconComp size={22} color="#576561" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '0 2px'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px'
  },
  label: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#7b8a86',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  categoryCount: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#b7c6c2'
  },
  scrollStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    paddingBottom: '4px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  activePill: {
    minWidth: '168px',
    height: '56px',
    borderRadius: '28px',
    backgroundColor: '#171e19',
    border: 'none',
    padding: '0 12px 0 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    boxShadow: '0 8px 20px rgba(23, 30, 25, 0.2)',
    transition: 'all 0.2s ease'
  },
  activeRedCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ca0013',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  activeTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    overflow: 'hidden'
  },
  activeTitle: {
    fontSize: '12.5px',
    fontWeight: '800',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  activeSub: {
    fontSize: '9.5px',
    fontWeight: '700',
    color: '#b7c6c2',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  inactiveSquare: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(183, 198, 194, 0.3)',
    boxShadow: '0 4px 12px rgba(23, 30, 25, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    transition: 'all 0.15s ease'
  }
};
