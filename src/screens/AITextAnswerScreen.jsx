import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Quote, Sparkles } from 'lucide-react';
import { useTranscription } from '../hooks/useTranscription';
import { AssessmentTypeSelector } from '../components/AssessmentTypeSelector';
import { AnswerCard } from '../components/AnswerCard';
import { countWords } from '../utils/transcriptHelpers';

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

  const hasLiveTranscript = !!liveTranscriptText?.trim();
  const hasSnapshot = !!submittedSnapshot?.text;

  const handleSelectType = (newType) => {
    setSelectedAssessmentType(newType);
    const targetText = submittedSnapshot?.text || (hasLiveTranscript ? liveTranscriptText : '');
    if (targetText && targetText.trim()) {
      submitToBedrock(targetText.trim(), newType);
    }
  };

  const handleGetAnswerForLive = () => {
    if (hasLiveTranscript) {
      submitToBedrock(liveTranscriptText, selectedAssessmentType);
    }
  };

  const snapshotText = submittedSnapshot?.text || (hasLiveTranscript ? liveTranscriptText : '');
  const snapshotWordCount = countWords(snapshotText);

  return (
    <div className="screen" style={styles.screen}>
      <div className="scroll-content">
        {/* 1. Horizontal Scroll Selector: 7 Categories with 56x56 square & 160px active pill */}
        <AssessmentTypeSelector
          selectedType={selectedAssessmentType}
          onSelectType={handleSelectType}
        />

        {/* 2. Secondary Feed Item: Captured Question Snapshot Card (24px radius, 52px icon, 40px button) */}
        <div className="feed-card" style={{ flexDirection: 'column', gap: '8px' }}>
          <div
            style={styles.feedCardTop}
            onClick={() => setIsSnapshotExpanded(!isSnapshotExpanded)}
          >
            <div className="feed-icon-56" style={{ width: '44px', height: '44px' }}>
              <Quote size={20} />
            </div>

            <div style={styles.feedCardHeaderInfo}>
              <div style={styles.feedCardTitleRow}>
                <span className="feed-title" style={{ fontSize: '15px' }}>
                  {submittedSnapshot ? 'Captured Question' : 'Current Live Speech'}
                </span>
                <span style={styles.wordBadge}>{snapshotWordCount} words</span>
              </div>
              <span style={styles.feedCardSub}>
                {submittedSnapshot ? 'Immutable snapshot submitted to AI' : 'Speech captured from laptop'}
              </span>
            </div>

            <button style={styles.toggleBtn} aria-label="Toggle Question View">
              {isSnapshotExpanded ? (
                <ChevronUp size={18} color="#576561" />
              ) : (
                <ChevronDown size={18} color="#576561" />
              )}
            </button>
          </div>

          {isSnapshotExpanded && (
            <div style={styles.feedCardBody}>
              {snapshotText ? (
                <p style={styles.snapshotQuote}>"{snapshotText}"</p>
              ) : (
                <p style={styles.placeholderText}>
                  No speech captured yet. Switch to <strong>AI Transcribe</strong> to listen to the question.
                </p>
              )}

              {!submittedSnapshot && hasLiveTranscript && (
                <button onClick={handleGetAnswerForLive} className="btn-primary-red" style={{ marginTop: '8px' }}>
                  <Sparkles size={14} /> Generate Answer for this Question
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Hero Feature Card: Formatted according to the assessment */}
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
    backgroundColor: '#eeebe3'
  },
  feedCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    cursor: 'pointer'
  },
  feedCardHeaderInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px'
  },
  feedCardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  wordBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#ca0013',
    backgroundColor: 'rgba(202, 0, 19, 0.08)',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  feedCardSub: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#7b8a86'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  feedCardBody: {
    paddingTop: '6px',
    borderTop: '1px solid rgba(183, 198, 194, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  snapshotQuote: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#171e19',
    lineHeight: '1.5',
    fontStyle: 'italic',
    userSelect: 'text'
  },
  placeholderText: {
    fontSize: '12.5px',
    color: '#7b8a86',
    fontStyle: 'italic'
  }
};
