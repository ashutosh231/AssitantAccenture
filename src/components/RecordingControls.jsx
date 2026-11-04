import React, { useState } from 'react';
import { Play, Pause, Sparkles, PlusCircle, Trash2, Mic } from 'lucide-react';

export function RecordingControls({
  listeningStatus,
  hasContent,
  onTogglePlayPause,
  onSendToAI,
  onNewTranscript,
  onClearTranscript,
  hideSendToAi = false
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
      <div
        style={{
          ...styles.container,
          gridTemplateColumns: hideSendToAi
            ? '1.5fr 1fr 1fr'
            : '1.1fr 1.6fr 0.9fr 0.9fr'
        }}
      >
        {/* 1. Play / Pause Control */}
        <button
          onClick={onTogglePlayPause}
          style={{
            ...styles.controlBtn,
            backgroundColor: isListening ? '#171e19' : '#ca0013',
            color: '#ffffff',
            boxShadow: isListening
              ? '0 6px 16px rgba(23, 30, 25, 0.2)'
              : '0 6px 16px rgba(202, 0, 19, 0.3)'
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

        {/* 2. Send to AI (Vibrant Red High-Impact CTA) - only when not hidden */}
        {!hideSendToAi && (
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
            <span style={styles.sendAiSub}>Choose Category</span>
          </button>
        )}

        {/* 3. New Transcript Control */}
        <button
          onClick={handleNewClick}
          style={{
            ...styles.controlBtn,
            ...styles.secondaryBtn
          }}
          title="Start fresh transcription session"
        >
          <PlusCircle size={18} color="#576561" />
          <span style={styles.secondaryLabel}>New</span>
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
          <Trash2 size={18} color="#576561" />
          <span style={styles.secondaryLabel}>Clear</span>
        </button>
      </div>

      {/* Confirmation Dialog Modal with 40px radius */}
      {confirmModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>
              {confirmModal === 'new' ? 'Start New Transcript?' : 'Clear Current Transcript?'}
            </h3>
            <p style={styles.modalMessage}>
              {confirmModal === 'new'
                ? 'Starting a fresh session will reset the current transcript and session timer.'
                : 'This will clear the displayed transcript. Any previously generated answer will remain saved.'}
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
                  backgroundColor: '#ca0013'
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
    gridTemplateColumns: '1.1fr 1.6fr 0.9fr 0.9fr',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#ffffff',
    borderRadius: '28px',
    border: '1px solid rgba(183, 198, 194, 0.3)',
    boxShadow: '0 8px 24px rgba(23, 30, 25, 0.05)',
    alignItems: 'center'
  },
  controlBtn: {
    border: 'none',
    borderRadius: '18px',
    padding: '8px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    minHeight: '52px'
  },
  sendAiBtn: {
    backgroundColor: '#ca0013',
    boxShadow: '0 8px 20px rgba(202, 0, 19, 0.3)',
    color: '#ffffff'
  },
  sendAiContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  sendAiLabel: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#ffffff'
  },
  sendAiSub: {
    fontSize: '9.5px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700'
  },
  secondaryBtn: {
    backgroundColor: 'rgba(238, 235, 227, 0.5)',
    border: '1px solid rgba(183, 198, 194, 0.3)',
    color: '#576561'
  },
  controlLabel: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.2px'
  },
  secondaryLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#576561'
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(23, 30, 25, 0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 100
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '32px',
    border: '1px solid rgba(183, 198, 194, 0.3)',
    padding: '24px 20px',
    width: '100%',
    maxWidth: '340px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 20px 50px rgba(23, 30, 25, 0.25)'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#171e19'
  },
  modalMessage: {
    fontSize: '13.5px',
    lineHeight: '1.5',
    color: '#576561',
    fontWeight: '600'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '6px'
  },
  modalCancelBtn: {
    padding: '9px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(183, 198, 194, 0.4)',
    borderRadius: '9999px',
    color: '#576561',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  modalConfirmBtn: {
    padding: '9px 18px',
    border: 'none',
    borderRadius: '9999px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(202, 0, 19, 0.3)'
  }
};
