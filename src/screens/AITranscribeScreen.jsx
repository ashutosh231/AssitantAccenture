import React, { useRef, useEffect, useState } from 'react';
import { Volume2, Info, AlertTriangle, Sparkles, ChevronDown, Mic, Clock, Gauge, Copy, Check } from 'lucide-react';
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
    submitToBedrock(liveTranscriptText, chosenType);
    setIsPickerOpen(false);
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

        {/* 2. Hero Feature Card: 40px radius, decorative blob, 64x64 icon, bento metrics, alert box */}
        <div className="hero-card">
          <div className="decorative-blob" />

          <div className="hero-top-row">
            <div className="icon-holder-64">{currentEmoji}</div>
            <div style={styles.heroStatusPill}>
              <div
                style={{
                  ...styles.statusDot,
                  backgroundColor: listeningStatus === 'listening' ? '#ca0013' : '#b7c6c2',
                  boxShadow: listeningStatus === 'listening' ? '0 0 8px rgba(202, 0, 19, 0.6)' : 'none'
                }}
              />
              <span style={styles.statusLabel}>
                {listeningStatus === 'listening' ? 'LIVE AUDIO' : listeningStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <span style={styles.heroSubheader}>ACTIVE MODULE</span>
            <h2 style={styles.heroMainTitle}>{selectedAssessmentType}</h2>
          </div>

          {/* Waveform Visualizer */}
          <AudioWaveform
            listeningStatus={listeningStatus}
            audioLevel={audioLevel}
            sessionDuration={sessionDuration}
          />

          {/* Nested 2-column Grid for Bento Metrics */}
          <div className="bento-metric-grid">
            <div className="bento-metric-card">
              <div className="bento-icon-circle">
                <Mic size={16} />
              </div>
              <div className="bento-text-group">
                <span className="bento-title">SOURCE</span>
                <span className="bento-value">Laptop Audio</span>
              </div>
            </div>

            <div className="bento-metric-card">
              <div className="bento-icon-circle">
                <Gauge size={16} />
              </div>
              <div className="bento-text-group">
                <span className="bento-title">TARGET PACE</span>
                <span className="bento-value">
                  {selectedAssessmentType === '45-Second Speech' ? '90-120 Words' : '135 WPM'}
                </span>
              </div>
            </div>
          </div>

          {/* Alert / Info box at bottom using #b7c6c2/20 background */}
          <div className="hero-alert-box">
            <Info size={18} color="#576561" style={{ flexShrink: 0 }} />
            <span className="hero-alert-text">
              Phone captures laptop audio acoustically. Keep your phone near the laptop speakers in a quiet room.
            </span>
          </div>
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
                <div className="feed-icon-56" style={{ width: '42px', height: '42px', borderRadius: '14px' }}>
                  <Volume2 size={20} />
                </div>
                <div>
                  <div style={styles.boxTagRow}>
                    <span style={styles.boxTitle}>CONTINUOUS SPEECH FEED</span>
                    {listeningStatus === 'listening' && (
                      <span style={styles.liveBadge}>
                        <span style={styles.livePulseDot} /> LIVE
                      </span>
                    )}
                  </div>
                  <span style={styles.boxSub}>
                    {hasContent ? 'Unified into 1 box across all pauses' : 'Waiting for laptop audio...'}
                  </span>
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
                  Tap <strong>Listen</strong> below. Words spoken by your laptop will flow continuously into this box as a single passage without creating separate boxes on pauses.
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
    fontSize: '10px',
    fontWeight: '800',
    color: '#7b8a86',
    letterSpacing: '1px',
    textTransform: 'uppercase'
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
    gap: '12px',
    minHeight: '130px',
    padding: '16px 18px'
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
    fontSize: '13.5px',
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
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#7b8a86'
  },
  boxBody: {
    paddingTop: '6px',
    borderTop: '1px solid rgba(183, 198, 194, 0.25)',
    width: '100%',
    maxHeight: '260px',
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
