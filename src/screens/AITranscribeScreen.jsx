import React, { useRef, useEffect, useState } from 'react';
import { Volume2, AlertTriangle, Mic, Copy, Check } from 'lucide-react';
import { useTranscription } from '../hooks/useTranscription';
import { AssessmentTypeSelector } from '../components/AssessmentTypeSelector';
import { AudioWaveform } from '../components/AudioWaveform';
import { RecordingControls } from '../components/RecordingControls';
import { AssessmentPickerModal } from '../components/AssessmentPickerModal';
import { countWords } from '../utils/transcriptHelpers';

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
  const [copied, setCopied] = useState(false);
  const scrollBottomRef = useRef(null);

  // Auto-scroll when new text or segments arrive
  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [finalizedSegments, interimTranscript]);

  const hasContent = !!(finalizedSegments.length > 0 || interimTranscript.trim());

  // Compile finalized text into a single continuous paragraph (no separate boxes on pause)
  const finalizedText = finalizedSegments
    .map((s) => s.text?.trim())
    .filter(Boolean)
    .join(' ');

  const totalWords = countWords(liveTranscriptText);

  const handleCopyTranscript = () => {
    if (!liveTranscriptText) return;
    navigator.clipboard.writeText(liveTranscriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPicker = () => {
    if (!hasContent) {
      alert('The transcript is currently empty. Please capture speech from the laptop first.');
      return;
    }
    setIsPickerOpen(true);
  };

  const handleSelectAndSubmit = (chosenType) => {
    setSelectedAssessmentType(chosenType);
    // Snapshot the current text before clearing
    submitToBedrock(liveTranscriptText, chosenType);
    setIsPickerOpen(false);
    // Clear transcript so next recording starts fresh
    newTranscript();
    setActiveTab('answer');
  };

  const EMOJI_MAP = {
    'Scenario-Based Reply': '💬',
    'Situation-Based Answer': '🧠',
    'Read Aloud': '📖',
    'Repeat What You Hear': '🔊',
    'Correct the Wrong Sentence': '✅',
    'Fill in the Blanks': '✨',
    '45-Second Speech': '⏱️'
  };

  const currentEmoji = EMOJI_MAP[selectedAssessmentType] || '🎙️';

  return (
    <div className="screen" style={styles.screen}>
      <div className="scroll-content">
        {/* 1. Horizontal Scroll Selector: 7 Categories with 56x56 square & 160px active pill */}
        <AssessmentTypeSelector
          selectedType={selectedAssessmentType}
          onSelectType={setSelectedAssessmentType}
        />

        {/* 2. Hero Feature Card: compact — status pill, title, waveform only */}
        <div className="hero-card" style={styles.heroCardCompact}>
          <div className="hero-top-row">
            <div style={styles.heroTitleGroup}>
              <div className="icon-holder-64" style={styles.heroIconSmall}>{currentEmoji}</div>
              <div>
                <span style={styles.heroSubheader}>{selectedAssessmentType}</span>
              </div>
            </div>
            <div style={styles.heroStatusPill}>
              <div
                style={{
                  ...styles.statusDot,
                  backgroundColor: listeningStatus === 'listening' ? '#ca0013' : '#b7c6c2',
                  boxShadow: listeningStatus === 'listening' ? '0 0 8px rgba(202, 0, 19, 0.6)' : 'none'
                }}
              />
              <span style={styles.statusLabel}>
                {listeningStatus === 'listening' ? 'LIVE' : listeningStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Waveform Visualizer */}
          <AudioWaveform
            listeningStatus={listeningStatus}
            audioLevel={audioLevel}
            sessionDuration={sessionDuration}
          />
        </div>

        {/* 3. Error Banner (if any) */}
        {transcribeError && (
          <div style={styles.errorBanner}>
            <AlertTriangle size={16} color="#ca0013" style={{ flexShrink: 0 }} />
            <span style={styles.errorBannerText}>{transcribeError}</span>
          </div>
        )}

        {/* 4. Single Unified Transcript Box (All speech kept in 1 continuous box, even across pauses) */}
        <div style={styles.feedSection}>
          <div style={styles.feedHeaderRow}>
            <span style={styles.feedHeaderLabel}>LIVE CAPTURED TRANSCRIPT</span>
            <span style={styles.feedCountLabel}>
              {totalWords} word{totalWords === 1 ? '' : 's'}
            </span>
          </div>

          <div className="feed-card" style={styles.unifiedCard}>
            {/* Box Header */}
            <div style={styles.boxTopRow}>
              <div style={styles.boxTitleGroup}>
                <div className="feed-icon-56" style={{ width: '36px', height: '36px', borderRadius: '12px' }}>
                  <Volume2 size={17} />
                </div>
                <div style={styles.boxTagRow}>
                  <span style={styles.boxTitle}>
                    {listeningStatus === 'listening' ? 'LISTENING…' : 'SPEECH FEED'}
                  </span>
                  {listeningStatus === 'listening' && (
                    <span style={styles.liveBadge}>
                      <span style={styles.livePulseDot} /> LIVE
                    </span>
                  )}
                </div>
              </div>

              {hasContent && (
                <button
                  onClick={handleCopyTranscript}
                  className="feed-action-btn-40"
                  title="Copy full transcript"
                  aria-label="Copy full transcript"
                >
                  {copied ? <Check size={18} color="#ffffff" /> : <Copy size={18} />}
                </button>
              )}
            </div>

            {/* Box Body: Continuous Text */}
            <div style={styles.boxBody}>
              {!hasContent ? (
                <p style={styles.placeholderText}>
                  Tap <strong>Listen</strong> — laptop speech flows in here.
                </p>
              ) : (
                <p style={styles.continuousText}>
                  {finalizedText}
                  {interimTranscript && (
                    <span style={styles.interimText}>
                      {finalizedText ? ' ' : ''}
                      {interimTranscript}
                      <span style={styles.pulsingInlineDot} />
                    </span>
                  )}
                </p>
              )}
              <div ref={scrollBottomRef} style={{ height: '2px' }} />
            </div>
          </div>
        </div>

        {/* 5. Bottom Recording Controls */}
        <RecordingControls
          listeningStatus={listeningStatus}
          hasContent={hasContent}
          onTogglePlayPause={togglePlayPause}
          onSendToAI={handleOpenPicker}
          onNewTranscript={newTranscript}
          onClearTranscript={clearTranscript}
        />
      </div>

      {/* 6. Assessment Type Selection Bottom Sheet */}
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
    backgroundColor: '#eeebe3',
    position: 'relative'
  },
  heroCardCompact: {
    padding: '14px 18px',
    gap: '10px'
  },
  heroTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  heroIconSmall: {
    width: '36px',
    height: '36px',
    fontSize: '18px',
    flexShrink: 0
  },
  heroStatusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(238, 235, 227, 0.6)',
    padding: '4px 10px',
    borderRadius: '9999px',
    border: '1px solid rgba(183, 198, 194, 0.3)'
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%'
  },
  statusLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#171e19',
    letterSpacing: '0.8px'
  },
  heroSubheader: {
    fontSize: '15px',
    fontWeight: '900',
    color: '#171e19',
    letterSpacing: '-0.2px'
  },
  heroMainTitle: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#171e19',
    letterSpacing: '-0.4px',
    lineHeight: '1.2'
  },
  errorBanner: {
    backgroundColor: 'rgba(202, 0, 19, 0.08)',
    border: '1px solid rgba(202, 0, 19, 0.25)',
    borderRadius: '16px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorBannerText: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#ca0013',
    lineHeight: '1.4'
  },
  feedSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  feedHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px'
  },
  feedHeaderLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#7b8a86',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  feedCountLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#576561'
  },
  unifiedCard: {
    flexDirection: 'column',
    gap: '10px',
    minHeight: '110px',
    padding: '14px 16px'
  },
  boxTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  boxTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  boxTagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  boxTitle: {
    fontSize: '12.5px',
    fontWeight: '800',
    color: '#171e19'
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#ca0013',
    backgroundColor: 'rgba(202, 0, 19, 0.08)',
    padding: '1px 6px',
    borderRadius: '6px'
  },
  livePulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ca0013',
    boxShadow: '0 0 6px rgba(202, 0, 19, 0.8)'
  },
  boxSub: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#7b8a86'
  },
  boxBody: {
    paddingTop: '6px',
    borderTop: '1px solid rgba(183, 198, 194, 0.25)',
    width: '100%',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  placeholderText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#7b8a86',
    lineHeight: '1.5',
    fontStyle: 'italic'
  },
  continuousText: {
    fontSize: '15.5px',
    fontWeight: '700',
    color: '#171e19',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    userSelect: 'text'
  },
  interimText: {
    color: '#ca0013',
    fontStyle: 'italic',
    fontWeight: '700',
    display: 'inline'
  },
  pulsingInlineDot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#ca0013',
    marginLeft: '6px',
    verticalAlign: 'middle',
    boxShadow: '0 0 6px rgba(202, 0, 19, 0.7)',
    animation: 'pulse-interim 1.2s infinite ease-in-out'
  }
};
