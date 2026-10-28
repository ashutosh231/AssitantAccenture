import React, { useRef, useEffect } from 'react';
import { Volume2, Info, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTranscription } from '../hooks/useTranscription';
import { AudioWaveform } from '../components/AudioWaveform';
import { TranscriptSegment } from '../components/TranscriptSegment';
import { RecordingControls } from '../components/RecordingControls';

export function AITranscribeScreen() {
  const {
    listeningStatus,
    finalizedSegments,
    interimTranscript,
    transcribeError,
    sessionDuration,
    audioLevel,
    togglePlayPause,
    handleSendToAI,
    newTranscript,
    clearTranscript,
    liveTranscriptText,
    setActiveTab
  } = useTranscription();

  const scrollBottomRef = useRef(null);

  // Auto-scroll when new text or segments arrive
  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [finalizedSegments, interimTranscript]);

  const hasContent = !!(finalizedSegments.length > 0 || interimTranscript.trim());

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
                <span>Review the suggested response and speak your answer verbally.</span>
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

      {/* 5. Sticky Bottom Recording Controls */}
      <RecordingControls
        listeningStatus={listeningStatus}
        hasContent={hasContent}
        onTogglePlayPause={togglePlayPause}
        onSendToAI={handleSendToAI}
        onNewTranscript={newTranscript}
        onClearTranscript={clearTranscript}
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
    backgroundColor: '#080c15'
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
  }
};

