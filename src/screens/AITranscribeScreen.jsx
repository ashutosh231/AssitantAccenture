import React, { useRef, useEffect, useState } from 'react';
import { Volume2, Info, AlertTriangle, Sparkles, ChevronDown } from 'lucide-react';
import { useTranscription } from '../hooks/useTranscription';
import { AudioWaveform } from '../components/AudioWaveform';
import { TranscriptSegment } from '../components/TranscriptSegment';
import { RecordingControls } from '../components/RecordingControls';
import { AssessmentPickerModal } from '../components/AssessmentPickerModal';

export function AITranscribeScreen() {
  const {
    listeningStatus,
    finalizedSegments,
    interimTranscript,
    transcribeError,
    sessionDuration,
    audioLevel,
    togglePlayPause,
    newTranscript,
    clearTranscript,
    liveTranscriptText,
    selectedAssessmentType,
    setSelectedAssessmentType,
    submitToBedrock,
    setActiveTab
  } = useTranscription();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const scrollBottomRef = useRef(null);

  // Auto-scroll when new text or segments arrive
  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [finalizedSegments, interimTranscript]);

  const hasContent = !!(finalizedSegments.length > 0 || interimTranscript.trim());

  /**
   * When user taps "Send to AI", open assessment selector
   */
  const handleOpenPicker = () => {
    if (!hasContent) {
      alert('The transcript is currently empty. Please capture speech from the laptop first.');
      return;
    }
    setIsPickerOpen(true);
  };

  /**
   * When user selects a specific assessment type from the picker modal
   */
  const handleSelectAndSubmit = (chosenType) => {
    setSelectedAssessmentType(chosenType);
    submitToBedrock(liveTranscriptText, chosenType);
    setIsPickerOpen(false);
    setActiveTab('answer');
  };

  return (
    <div className="screen" style={styles.screen}>
      {/* 1. Live Waveform & Session Header */}
      <AudioWaveform
        listeningStatus={listeningStatus}
        audioLevel={audioLevel}
        sessionDuration={sessionDuration}
      />

      {/* 2. Transparency Notice */}
      <div className="transparency-banner">
        <Info size={13} />
        <span>
          Microphone captures audio through the air. Place phone near laptop speakers in a quiet room.
        </span>
      </div>

      {/* 3. Error Banner (if any) */}
      {transcribeError && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
          <span style={styles.errorBannerText}>{transcribeError}</span>
        </div>
      )}

      {/* 4. Scrollable Transcript Area */}
      <div style={styles.transcriptArea}>
        {!hasContent ? (
          <div style={styles.emptyStateContainer}>
            <div style={styles.emptyStateIcon}>
              <Volume2 size={36} color="#3b82f6" />
            </div>
            <h3 style={styles.emptyStateTitle}>Waiting for laptop audio...</h3>
            <p style={styles.emptyStateSub}>
              Tap <strong>Listen</strong> below. As your laptop speaks the question or instructions aloud,
              words will transcribe here in real-time.
            </p>
            <div style={styles.tipsList}>
              <div style={styles.tipItem}>
                <span style={styles.tipNum}>1</span>
                <span>Remain silent while the laptop AI is speaking.</span>
              </div>
              <div style={styles.tipItem}>
                <span style={styles.tipNum}>2</span>
                <span>Once the question is complete, tap <strong>Send to AI</strong>.</span>
              </div>
              <div style={styles.tipItem}>
                <span style={styles.tipNum}>3</span>
                <span>Select the assessment category to receive the exact answer format.</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.segmentsList}>
            {finalizedSegments.map((segment) => (
              <TranscriptSegment key={segment.id || segment.timestamp} segment={segment} />
            ))}

            {interimTranscript && (
              <TranscriptSegment segment={{ text: interimTranscript }} isInterim={true} />
            )}

            <div ref={scrollBottomRef} style={{ height: '4px' }} />
          </div>
        )}
      </div>

      {/* 5. Quick Assessment Format Indicator Bar */}
      <div style={styles.typeBar}>
        <div style={styles.typeBarLeft}>
          <Sparkles size={13} color="#c084fc" />
          <span style={styles.typeBarLabel}>TARGET FORMAT:</span>
        </div>
        <button
          onClick={() => setIsPickerOpen(true)}
          style={styles.typeBarBtn}
          title="Change assessment format"
        >
          <span style={styles.typeBarValue}>{selectedAssessmentType}</span>
          <ChevronDown size={13} color="#c084fc" />
        </button>
      </div>

      {/* 6. Sticky Bottom Recording Controls */}
      <RecordingControls
        listeningStatus={listeningStatus}
        hasContent={hasContent}
        onTogglePlayPause={togglePlayPause}
        onSendToAI={handleOpenPicker}
        onNewTranscript={newTranscript}
        onClearTranscript={clearTranscript}
      />

      {/* 7. Assessment Type Selection Bottom Sheet */}
      <AssessmentPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        transcriptText={liveTranscriptText}
        selectedType={selectedAssessmentType}
        onSelectAndSubmit={handleSelectAndSubmit}
      />
    </div>
  );
}

const styles = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#080c15',
    position: 'relative'
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorBannerText: {
    fontSize: '12px',
    color: '#fca5a5',
    lineHeight: '1.4'
  },
  transcriptArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column'
  },
  emptyStateContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px 10px',
    gap: '12px'
  },
  emptyStateIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyStateTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  emptyStateSub: {
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#94a3b8',
    maxWidth: '320px'
  },
  tipsList: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    maxWidth: '340px',
    textAlign: 'left'
  },
  tipItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '12px',
    color: '#cbd5e1'
  },
  tipNum: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: '#60a5fa',
    flexShrink: 0
  },
  segmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  typeBar: {
    padding: '6px 14px',
    backgroundColor: '#0c1322',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  typeBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  typeBarLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.4px'
  },
  typeBarBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '8px',
    padding: '3px 8px',
    cursor: 'pointer',
    backgroundColor: 'rgba(139, 92, 246, 0.1)'
  },
  typeBarValue: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#c084fc'
  }
};
