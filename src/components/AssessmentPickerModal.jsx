import React from 'react';
import {
  X,
  Sparkles,
  MessageSquareText,
  Brain,
  BookOpen,
  Volume2,
  CheckCircle2,
  Mic,
  ChevronRight
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

export function AssessmentPickerModal({
  isOpen,
  onClose,
  transcriptText,
  selectedType,
  onSelectAndSubmit
}) {
  if (!isOpen) return null;

  const previewText = transcriptText?.trim() || '';
  const truncatedPreview =
    previewText.length > 120 ? `${previewText.slice(0, 120)}...` : previewText;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Drag handle */}
        <div style={styles.dragHandle} />

        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.titleRow}>
              <div style={styles.sparkleCircle}>
                <Sparkles size={16} color="#ffffff" />
              </div>
              <h2 style={styles.title}>Select Assessment Type</h2>
            </div>
            <p style={styles.subtitle}>
              Format the AI response to match the exact assessment rubric
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={20} color="#576561" />
          </button>
        </div>

        {/* Question Snapshot Preview */}
        {previewText && (
          <div style={styles.previewBox}>
            <span style={styles.previewLabel}>CAPTURED QUESTION PREVIEW</span>
            <p style={styles.previewText}>"{truncatedPreview}"</p>
          </div>
        )}

        {/* 7 Assessment Options Grid / List with 24px radius cards */}
        <div style={styles.optionsList}>
          {ASSESSMENT_TYPES.map((type) => {
            const IconComp = ICON_MAP[type.icon] || Sparkles;
            const isSelected = type.id === selectedType;

            return (
              <button
                key={type.id}
                onClick={() => onSelectAndSubmit(type.id)}
                style={{
                  ...styles.optionCard,
                  borderColor: isSelected ? '#ca0013' : 'rgba(183, 198, 194, 0.35)',
                  backgroundColor: isSelected ? 'rgba(202, 0, 19, 0.04)' : '#ffffff'
                }}
              >
                <div
                  style={{
                    ...styles.iconWrapper,
                    backgroundColor: isSelected ? '#ca0013' : 'rgba(23, 30, 25, 0.05)',
                    color: isSelected ? '#ffffff' : '#171e19'
                  }}
                >
                  <IconComp size={18} />
                </div>

                <div style={styles.optionContent}>
                  <div style={styles.optionTitleRow}>
                    <span style={styles.optionTitle}>{type.title}</span>
                    <span style={styles.optionTag}>{type.tag}</span>
                  </div>
                  <p style={styles.optionDesc}>{type.shortDesc}</p>
                </div>

                <div
                  style={{
                    ...styles.chevronCircle,
                    backgroundColor: isSelected ? '#ca0013' : 'rgba(238, 235, 227, 0.8)',
                    color: isSelected ? '#ffffff' : '#576561'
                  }}
                >
                  <ChevronRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(23, 30, 25, 0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    zIndex: 90
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: '40px',
    borderTopRightRadius: '40px',
    border: '1px solid rgba(183, 198, 194, 0.35)',
    borderBottom: 'none',
    maxHeight: '86vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -20px 50px rgba(23, 30, 25, 0.25)',
    animation: 'slideUp 0.25s ease-out'
  },
  dragHandle: {
    width: '40px',
    height: '4px',
    backgroundColor: 'rgba(183, 198, 194, 0.6)',
    borderRadius: '2px',
    margin: '12px auto 4px auto'
  },
  header: {
    padding: '14px 20px 8px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sparkleCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#ca0013',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#171e19',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#7b8a86',
    marginTop: '2px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px'
  },
  previewBox: {
    margin: '8px 20px 10px 20px',
    padding: '10px 14px',
    backgroundColor: 'rgba(238, 235, 227, 0.6)',
    borderRadius: '16px',
    border: '1px solid rgba(183, 198, 194, 0.25)'
  },
  previewLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#7b8a86',
    letterSpacing: '0.8px',
    textTransform: 'uppercase'
  },
  previewText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#171e19',
    lineHeight: '1.45',
    fontStyle: 'italic',
    marginTop: '2px'
  },
  optionsList: {
    padding: '6px 20px 28px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  optionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '24px',
    border: '1px solid',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    width: '100%',
    boxShadow: '0 4px 12px rgba(23, 30, 25, 0.03)'
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s ease'
  },
  optionContent: {
    flex: 1,
    minWidth: 0
  },
  optionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px'
  },
  optionTitle: {
    fontSize: '14.5px',
    fontWeight: '800',
    color: '#171e19'
  },
  optionTag: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#ca0013',
    backgroundColor: 'rgba(202, 0, 19, 0.08)',
    padding: '2px 8px',
    borderRadius: '10px',
    whiteSpace: 'nowrap'
  },
  optionDesc: {
    fontSize: '11.5px',
    color: '#576561',
    fontWeight: '600',
    marginTop: '2px',
    lineHeight: '1.3'
  },
  chevronCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }
};
