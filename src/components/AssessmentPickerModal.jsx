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
        {/* Handle bar */}
        <div style={styles.dragHandle} />

        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.titleRow}>
              <Sparkles size={18} color="#a855f7" />
              <h2 style={styles.title}>Select Assessment Type</h2>
            </div>
            <p style={styles.subtitle}>
              Choose the question format to generate the tailored response
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={18} color="#94a3b8" />
          </button>
        </div>

        {/* Question Snapshot Preview */}
        {previewText && (
          <div style={styles.previewBox}>
            <span style={styles.previewLabel}>CAPTURED QUESTION:</span>
            <p style={styles.previewText}>"{truncatedPreview}"</p>
          </div>
        )}

        {/* 8 Assessment Options Grid / List */}
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
                  borderColor: isSelected
                    ? 'rgba(168, 85, 247, 0.6)'
                    : 'rgba(255, 255, 255, 0.08)',
                  backgroundColor: isSelected
                    ? 'rgba(139, 92, 246, 0.16)'
                    : 'rgba(15, 23, 42, 0.6)'
                }}
              >
                <div
                  style={{
                    ...styles.iconWrapper,
                    backgroundColor: isSelected
                      ? '#8b5cf6'
                      : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected ? '#ffffff' : '#a855f7'
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

                <ChevronRight
                  size={18}
                  color={isSelected ? '#c084fc' : '#475569'}
                  style={{ flexShrink: 0 }}
                />
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
    backgroundColor: 'rgba(3, 7, 18, 0.82)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    zIndex: 80
  },
  sheet: {
    backgroundColor: '#0c1322',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderBottom: 'none',
    maxHeight: '84vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
    animation: 'slideUp 0.25s ease-out'
  },
  dragHandle: {
    width: '36px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '2px',
    margin: '10px auto 4px auto'
  },
  header: {
    padding: '12px 18px 8px 18px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f8fafc'
  },
  subtitle: {
    fontSize: '11.5px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#94a3b8'
  },
  previewBox: {
    margin: '6px 16px 10px 16px',
    padding: '8px 12px',
    backgroundColor: 'rgba(14, 22, 40, 0.8)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  previewLabel: {
    fontSize: '9.5px',
    fontWeight: '700',
    color: '#60a5fa',
    letterSpacing: '0.4px'
  },
  previewText: {
    fontSize: '12.5px',
    color: '#cbd5e1',
    lineHeight: '1.4',
    fontStyle: 'italic',
    marginTop: '2px'
  },
  optionsList: {
    padding: '4px 16px 24px 16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  optionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: '14px',
    border: '1px solid',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    width: '100%'
  },
  iconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
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
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#f8fafc'
  },
  optionTag: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#c084fc',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    padding: '2px 6px',
    borderRadius: '6px',
    whiteSpace: 'nowrap'
  },
  optionDesc: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
    lineHeight: '1.3'
  }
};

