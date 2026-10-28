import React, { useState } from 'react';
import { Play, Pause, Sparkles, PlusCircle, Trash2, Mic } from 'lucide-react';

export function RecordingControls({
  listeningStatus,
  hasContent,
  onTogglePlayPause,
  onSendToAI,
  onNewTranscript,
  onClearTranscript
}) {
  const [confirmModal, setConfirmModal] = useState(null); // 'new' | 'clear' | null

  const isListening = listeningStatus === 'listening';
  const isPaused = listeningStatus === 'paused';

  const handleNewClick = () => {
    if (hasContent) {
      setConfirmModal('new');
    } else {
      onNewTranscript();
    }
  };

  const handleClearClick = () => {
    if (hasContent) {
      setConfirmModal('clear');
    } else {
      onClearTranscript();
    }
  };

  const confirmAction = () => {
    if (confirmModal === 'new') {
      onNewTranscript();
    } else if (confirmModal === 'clear') {
      onClearTranscript();
    }
    setConfirmModal(null);
  };

  return (
    <>
      <div style={styles.container}>
        {/* 1. Play / Pause Control */}
        <button
          onClick={onTogglePlayPause}
          style={{
            ...styles.controlBtn,
            ...styles.playPauseBtn,
            backgroundColor: isListening ? '#f59e0b' : '#3b82f6',
            boxShadow: isListening
              ? '0 4px 14px rgba(245, 158, 11, 0.3)'
              : '0 4px 14px rgba(59, 130, 246, 0.3)'
          }}
          title={isListening ? 'Pause listening' : isPaused ? 'Resume listening' : 'Start listening'}
        >
          {isListening ? (
            <Pause size={18} color="#ffffff" />
          ) : isPaused ? (
            <Play size={18} color="#ffffff" style={{ marginLeft: '2px' }} />
          ) : (
            <Mic size={18} color="#ffffff" />
          )}
          <span style={styles.controlLabel}>
            {isListening ? 'Pause' : isPaused ? 'Resume' : 'Listen'}
          </span>
        </button>

        {/* 2. Send to AI (Prominent Purple Control) */}
        <button
          onClick={onSendToAI}
          style={{
            ...styles.controlBtn,
            ...styles.sendAiBtn,
            opacity: hasContent ? 1 : 0.65,
            cursor: hasContent ? 'pointer' : 'not-allowed'
          }}
          disabled={!hasContent}
          title={hasContent ? 'Submit snapshot to Amazon Bedrock' : 'Capture speech before submitting'}
        >
          <div style={styles.sendAiContent}>
            <Sparkles size={18} color="#ffffff" />
            <span style={styles.sendAiLabel}>Send to AI</span>
          </div>
          <span style={styles.sendAiSub}>Generate Answer</span>
        </button>

        {/* 3. New Transcript Control */}
        <button
          onClick={handleNewClick}
          style={{
            ...styles.controlBtn,
            ...styles.secondaryBtn
          }}
          title="Start a fresh transcription session"
        >
          <PlusCircle size={18} color="#94a3b8" />
          <span style={styles.controlLabel}>New</span>
        </button>

        {/* 4. Clear Control */}
        <button
          onClick={handleClearClick}
          style={{
            ...styles.controlBtn,
            ...styles.secondaryBtn
          }}
          title="Clear current transcript display"
        >
          <Trash2 size={18} color="#94a3b8" />
          <span style={styles.controlLabel}>Clear</span>
        </button>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>
              {confirmModal === 'new' ? 'Start New Transcript?' : 'Clear Current Transcript?'}
            </h3>
            <p style={styles.modalMessage}>
              {confirmModal === 'new'
                ? 'Starting a fresh session will reset the current transcript and duration timer. Are you sure you want to proceed?'
                : 'This will clear the current live transcript view. Any previously submitted answer snapshot will be preserved.'}
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setConfirmModal(null)}
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                style={{
                  ...styles.modalConfirmBtn,
                  backgroundColor: confirmModal === 'new' ? '#3b82f6' : '#ef4444'
                }}
              >
                {confirmModal === 'new' ? 'Start Fresh' : 'Clear Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.6fr 0.9fr 0.9fr',
    gap: '8px',
    padding: '12px 14px',
    backgroundColor: '#0c1322',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    alignItems: 'center'
  },
  controlBtn: {
    border: 'none',
    borderRadius: '12px',
    padding: '10px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    minHeight: '52px'
  },
  playPauseBtn: {
    color: '#ffffff'
  },
  sendAiBtn: {
    backgroundColor: '#8b5cf6',
    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
    color: '#ffffff'
  },
  sendAiContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  sendAiLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff'
  },
  sendAiSub: {
    fontSize: '9.5px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500'
  },
  secondaryBtn: {
    backgroundColor: '#172238',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#94a3b8'
  },
  controlLabel: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.2px'
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 6, 12, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 100
  },
  modalContent: {
    backgroundColor: '#111a2d',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '20px',
    width: '100%',
    maxWidth: '340px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f8fafc'
  },
  modalMessage: {
    fontSize: '13.5px',
    lineHeight: '1.5',
    color: '#94a3b8'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '6px'
  },
  modalCancelBtn: {
    padding: '8px 14px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    color: '#cbd5e1',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  modalConfirmBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
