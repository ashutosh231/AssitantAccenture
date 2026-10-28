import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Quote, Clock, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { useTranscription } from '../hooks/useTranscription';
import { AssessmentTypeSelector } from '../components/AssessmentTypeSelector';
import { AnswerCard } from '../components/AnswerCard';
import { countWords, formatDuration } from '../utils/transcriptHelpers';

export function AITextAnswerScreen() {
  const {
    submittedSnapshot,
    selectedAssessmentType,
    setSelectedAssessmentType,
    generatedAnswer,
    bedrockStatus,
    bedrockError,
    handleRegenerate,
    submitToBedrock,
    liveTranscriptText
  } = useTranscription();

  const [isSnapshotExpanded, setIsSnapshotExpanded] = useState(true);

  // If there's no snapshot yet, but live transcript exists
  const hasLiveTranscript = !!liveTranscriptText?.trim();
  const hasSnapshot = !!submittedSnapshot?.text;

  const handleGetAnswerForLive = () => {
    if (hasLiveTranscript) {
      submitToBedrock(liveTranscriptText, selectedAssessmentType);
    }
  };

  const snapshotText = submittedSnapshot?.text || (hasLiveTranscript ? liveTranscriptText : '');
  const snapshotWordCount = countWords(snapshotText);

  return (
    <div className="screen" style={styles.screen}>
      {/* 1. Assessment Type Selector */}
      <AssessmentTypeSelector
        selectedType={selectedAssessmentType}
        onSelectType={setSelectedAssessmentType}
      />

      <div style={styles.scrollContent}>
        {/* 2. Submitted Question / Transcript Snapshot Card */}
        <div style={styles.snapshotCard}>
          <div
            style={styles.snapshotHeader}
            onClick={() => setIsSnapshotExpanded(!isSnapshotExpanded)}
          >
            <div style={styles.snapshotHeaderLeft}>
              <Quote size={15} color="#60a5fa" />
              <span style={styles.snapshotTitle}>
                {submittedSnapshot ? 'Captured Question Snapshot' : 'Current Live Transcript'}
              </span>
              <span style={styles.snapshotBadge}>{snapshotWordCount} words</span>
            </div>
            <button style={styles.toggleBtn}>
              {isSnapshotExpanded ? (
                <ChevronUp size={16} color="#94a3b8" />
              ) : (
                <ChevronDown size={16} color="#94a3b8" />
              )}
            </button>
          </div>

          {isSnapshotExpanded && (
            <div style={styles.snapshotBody}>
              {snapshotText ? (
                <p style={styles.snapshotText}>"{snapshotText}"</p>
              ) : (
                <p style={styles.snapshotPlaceholder}>
                  No speech captured yet. Go to the <strong>AI Transcribe</strong> tab to listen to your laptop's question.
                </p>
              )}

              {/* If snapshot not submitted yet, show Get Answer shortcut button */}
              {!submittedSnapshot && hasLiveTranscript && (
                <div style={styles.getAnswerRow}>
                  <button onClick={handleGetAnswerForLive} style={styles.btnQuickSubmit}>
                    <Sparkles size={14} />
                    <span>Generate Answer for This Question</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Generated Answer Card */}
        <AnswerCard
          answer={generatedAnswer}
          status={bedrockStatus}
          error={bedrockError}
          selectedType={selectedAssessmentType}
          onRegenerate={handleRegenerate}
          onGetAnswer={handleGetAnswerForLive}
          hasSnapshot={hasSnapshot || hasLiveTranscript}
        />
      </div>
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
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  snapshotCard: {
    backgroundColor: '#0e1628',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden'
  },
  snapshotHeader: {
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    backgroundColor: 'rgba(23, 34, 57, 0.4)'
  },
  snapshotHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  snapshotTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#cbd5e1',
    letterSpacing: '0.2px'
  },
  snapshotBadge: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#60a5fa',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    padding: '2px 6px',
    borderRadius: '10px'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  snapshotBody: {
    padding: '12px 14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
  },
  snapshotText: {
    fontSize: '13.5px',
    lineHeight: '1.55',
    color: '#e2e8f0',
    fontStyle: 'italic',
    userSelect: 'text',
    wordBreak: 'break-word'
  },
  snapshotPlaceholder: {
    fontSize: '12.5px',
    color: '#64748b',
    fontStyle: 'italic'
  },
  getAnswerRow: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-start'
  },
  btnQuickSubmit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
  }
};
