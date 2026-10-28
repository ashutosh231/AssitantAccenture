import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RotateCw,
  Sparkles,
  Clock,
  AlertTriangle,
  FileText,
  HelpCircle,
  Gauge,
  SlidersHorizontal,
  Volume2
} from 'lucide-react';
import { countWords, estimateSpeechDuration } from '../utils/transcriptHelpers';

export function AnswerCard({
  answer,
  status,
  error,
  selectedType,
  onRegenerate,
  onGetAnswer,
  hasSnapshot
}) {
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState('answer'); // 'answer' | 'rubric'

  // When a new answer arrives, automatically slide to the answer view
  useEffect(() => {
    if (answer) {
      setActiveSlide('answer');
    }
  }, [answer]);

  const wordCount = countWords(answer || '');
  const estSeconds = estimateSpeechDuration(answer || '');

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = status === 'loading';
  const isError = status === 'error';

  // Emoji map for the assessment categories
  const EMOJI_MAP = {
    'Scenario-Based Reply': '💬',
    'Situation-Based Answer': '🧠',
    'Read Aloud': '📖',
    'Repeat What You Hear': '🔊',
    'Correct the Wrong Sentence': '✅',
    'Fill in the Blanks': '✨',
    '45-Second Speech': '⏱️'
  };

  const currentEmoji = EMOJI_MAP[selectedType] || '🎯';

  // Format the output according to the assessment type
  const renderFormattedAssessmentOutput = () => {
    if (!answer) return null;

    // 1. Correct the Wrong Sentence format
    if (selectedType === 'Correct the Wrong Sentence') {
      const parts = answer.split(/(?:Corrected Sentence:|Explanation:)/i).filter(Boolean);
      const corrected = parts[0]?.trim() || answer;
      const explanation = parts[1]?.trim() || '';

      return (
        <div style={styles.assessmentSection}>
          <div style={styles.bentoOutputCard}>
            <span style={styles.bentoCardLabel}>CORRECTED SENTENCE</span>
            <p style={styles.highlightedOutputText}>{corrected}</p>
          </div>

          {explanation && (
            <div style={{ ...styles.bentoOutputCard, backgroundColor: 'rgba(238, 235, 227, 0.7)' }}>
              <span style={styles.bentoCardLabel}>GRAMMATICAL EXPLANATION</span>
              <p style={styles.explanationText}>{explanation}</p>
            </div>
          )}
        </div>
      );
    }

    // 2. Fill in the Blanks format
    if (selectedType === 'Fill in the Blanks') {
      return (
        <div style={styles.assessmentSection}>
          <div style={styles.bentoOutputCard}>
            <span style={styles.bentoCardLabel}>COMPLETED SENTENCE & GRAMMAR RULE</span>
            <div style={styles.standardAnswerText}>{answer}</div>
          </div>
        </div>
      );
    }

    // 3. 45-Second Speech format
    if (selectedType === '45-Second Speech') {
      const isTargetMet = wordCount >= 85 && wordCount <= 125;
      return (
        <div style={styles.assessmentSection}>
          <div style={styles.speechPaceBanner}>
            <span style={styles.speechPaceTitle}>SPEECH TARGET MONITOR</span>
            <span
              style={{
                ...styles.speechPaceBadge,
                backgroundColor: isTargetMet ? 'rgba(23, 30, 25, 0.1)' : 'rgba(202, 0, 19, 0.1)',
                color: isTargetMet ? '#171e19' : '#ca0013'
              }}
            >
              {wordCount} / 90-120 Words ({isTargetMet ? 'Optimal Pace' : 'Adjust Delivery'})
            </span>
          </div>

          <div style={styles.standardAnswerText}>{answer}</div>
        </div>
      );
    }

    // 4. Repeat What You Hear
    if (selectedType === 'Repeat What You Hear') {
      return (
        <div style={styles.assessmentSection}>
          <div style={styles.repeatQuoteCard}>
            <span style={styles.bentoCardLabel}>VERBATIM RECALL SCRIPT</span>
            <p style={styles.verbatimText}>"{answer}"</p>
          </div>
        </div>
      );
    }

    // Default for Scenario-Based Reply, Situation-Based Answer, Read Aloud
    return (
      <div style={styles.standardAnswerContainer}>
        <div style={styles.standardAnswerText}>{answer}</div>
      </div>
    );
  };

  return (
    <div className="hero-card" style={styles.heroCardCustom}>
      {/* 1. Interactive Slider Switch at the top */}
      <div style={styles.sliderTrack}>
        <button
          onClick={() => setActiveSlide('answer')}
          style={{
            ...styles.sliderTab,
            backgroundColor: activeSlide === 'answer' ? '#171e19' : 'transparent',
            color: activeSlide === 'answer' ? '#ffffff' : '#576561'
          }}
        >
          <Sparkles size={14} color={activeSlide === 'answer' ? '#ca0013' : '#7b8a86'} />
          <span>Spoken Answer</span>
        </button>

        <button
          onClick={() => setActiveSlide('rubric')}
          style={{
            ...styles.sliderTab,
            backgroundColor: activeSlide === 'rubric' ? '#171e19' : 'transparent',
            color: activeSlide === 'rubric' ? '#ffffff' : '#576561'
          }}
        >
          <SlidersHorizontal size={14} color={activeSlide === 'rubric' ? '#ca0013' : '#7b8a86'} />
          <span>Metrics & Guide</span>
        </button>
      </div>

      {/* Slide 1: Spoken Response View (Dedicated, clean, zero overlap) */}
      {activeSlide === 'answer' && (
        <div style={styles.slideView}>
          {/* Top Bar with Icon, Title, and Actions */}
          <div style={styles.responseTopRow}>
            <div style={styles.responseTitleGroup}>
              <div style={styles.iconCircleSmall}>{currentEmoji}</div>
              <div>
                <span style={styles.miniLabel}>TARGET SCRIPT</span>
                <h3 style={styles.responseHeading}>{selectedType}</h3>
              </div>
            </div>

            <div style={styles.actionButtonGroup}>
              {answer && (
                <button onClick={handleCopy} className="btn-secondary-white" title="Copy answer">
                  {copied ? <Check size={14} color="#ca0013" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}

              {hasSnapshot && (
                <button
                  onClick={onRegenerate}
                  disabled={isLoading}
                  className="btn-primary-red"
                  style={{ padding: '8px 14px', fontSize: '12.5px' }}
                  title="Regenerate answer"
                >
                  <RotateCw size={13} className={isLoading ? 'spin-icon' : ''} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Pill Row */}
          {answer && !isLoading && (
            <div style={styles.statsPillRow}>
              <div style={styles.statPill}>
                <Clock size={12} color="#ca0013" />
                <span>~{estSeconds}s Speaking Time</span>
              </div>
              <div style={styles.statPill}>
                <span style={{ fontWeight: '800' }}>{wordCount} Words</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <div style={styles.loadingText}>
                <span style={styles.loadingBold}>Generating Assessment Response...</span>
                <span style={styles.loadingSub}>
                  Applying {selectedType} criteria via Bedrock
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div style={styles.errorContainer}>
              <div style={styles.errorHeader}>
                <AlertTriangle size={18} color="#ca0013" />
                <span style={styles.errorTitle}>Generation Interrupted</span>
              </div>
              <p style={styles.errorMsg}>{error}</p>
              <button
                onClick={onRegenerate}
                className="btn-primary-red"
                style={{ alignSelf: 'flex-start', marginTop: '6px' }}
              >
                <RotateCw size={14} /> Retry Request
              </button>
            </div>
          )}

          {/* Formatted Assessment Output */}
          {!isLoading && answer && renderFormattedAssessmentOutput()}

          {/* Empty State */}
          {!isLoading && !answer && !isError && (
            <div style={styles.emptyContainer}>
              <FileText size={36} color="#b7c6c2" />
              <p style={styles.emptyTitle}>Ready for assessment question</p>
              <p style={styles.emptySub}>
                Capture your laptop's audio on <strong>AI Transcribe</strong>, then tap the red Center Action button.
              </p>
              {hasSnapshot && (
                <button onClick={onGetAnswer} className="btn-primary-red" style={{ marginTop: '8px' }}>
                  <Sparkles size={16} /> Get Answer for Snapshot
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Slide 2: Metrics & Rubric Guide View */}
      {activeSlide === 'rubric' && (
        <div style={styles.slideView}>
          <div style={styles.rubricTopRow}>
            <div className="icon-holder-64">{currentEmoji}</div>
            <div>
              <span style={styles.miniLabel}>ASSESSMENT CRITERIA</span>
              <h2 style={styles.rubricHeading}>{selectedType}</h2>
            </div>
          </div>

          {/* 2-Column Bento Metric Grid */}
          <div className="bento-metric-grid" style={{ marginTop: '6px' }}>
            <div className="bento-metric-card">
              <div className="bento-icon-circle">
                <Gauge size={16} />
              </div>
              <div className="bento-text-group">
                <span className="bento-title">TARGET PACE</span>
                <span className="bento-value">
                  {selectedType === '45-Second Speech' ? '90-120 Words' : '135 WPM'}
                </span>
              </div>
            </div>

            <div className="bento-metric-card">
              <div className="bento-icon-circle">
                <Clock size={16} />
              </div>
              <div className="bento-text-group">
                <span className="bento-title">EST. DURATION</span>
                <span className="bento-value">
                  {answer ? `~${estSeconds}s (${wordCount}w)` : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Official Guidance Alert Box */}
          <div className="hero-alert-box" style={{ marginTop: '10px' }}>
            <HelpCircle size={18} color="#576561" style={{ flexShrink: 0 }} />
            <span className="hero-alert-text">
              {selectedType === '45-Second Speech' &&
                'Deliver a natural spoken response between 90–120 words. Open with a crisp 1-sentence hook, provide 2–3 structured points, and end decisively.'}
              {selectedType === 'Read Aloud' &&
                'Read with clear diction and natural pauses at punctuation. Do not paraphrase or add filler words.'}
              {selectedType === 'Repeat What You Hear' &&
                'Repeat the exact sentence verbatim with matching grammatical cadence and vocabulary.'}
              {selectedType === 'Correct the Wrong Sentence' &&
                'Identify the grammatical error, deliver the corrected sentence clearly, and explain the rule concisely.'}
              {selectedType === 'Fill in the Blanks' &&
                'Insert the grammatically correct word/phrase and ensure sentence tense consistency.'}
              {selectedType === 'Scenario-Based Reply' &&
                'Emphasize polite, constructive workplace communication, active accountability, and practical next steps.'}
              {selectedType === 'Situation-Based Answer' &&
                'Answer the scenario logically and directly. Do not force unnecessary STAR formatting if not required.'}
            </span>
          </div>

          <button
            onClick={() => setActiveSlide('answer')}
            className="btn-primary-red"
            style={{ marginTop: '12px', width: '100%' }}
          >
            <Sparkles size={16} /> Back to Spoken Answer
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  heroCardCustom: {
    padding: '18px 18px',
    gap: '12px',
    overflow: 'visible'
  },
  sliderTrack: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(238, 235, 227, 0.7)',
    borderRadius: '9999px',
    padding: '4px',
    gap: '4px',
    border: '1px solid rgba(183, 198, 194, 0.35)',
    width: '100%'
  },
  sliderTab: {
    flex: 1,
    height: '36px',
    borderRadius: '9999px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  slideView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%'
  },
  responseTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  responseTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  iconCircleSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(202, 0, 19, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0
  },
  miniLabel: {
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#7b8a86',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  responseHeading: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#171e19',
    lineHeight: '1.2'
  },
  actionButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  statsPillRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 10px',
    borderRadius: '9999px',
    backgroundColor: 'rgba(238, 235, 227, 0.6)',
    border: '1px solid rgba(183, 198, 194, 0.3)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#576561'
  },
  rubricTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%'
  },
  rubricHeading: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#171e19',
    lineHeight: '1.2'
  },
  standardAnswerContainer: {
    padding: '4px 0',
    width: '100%'
  },
  standardAnswerText: {
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.65',
    color: '#171e19',
    whiteSpace: 'pre-wrap',
    userSelect: 'text'
  },
  assessmentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%'
  },
  bentoOutputCard: {
    backgroundColor: '#ffffff',
    border: '1px solid rgba(183, 198, 194, 0.35)',
    borderRadius: '16px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  bentoCardLabel: {
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#ca0013',
    letterSpacing: '0.8px',
    textTransform: 'uppercase'
  },
  highlightedOutputText: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#171e19',
    lineHeight: '1.45'
  },
  explanationText: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#576561',
    lineHeight: '1.5'
  },
  speechPaceBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'rgba(238, 235, 227, 0.6)',
    borderRadius: '12px',
    marginBottom: '6px'
  },
  speechPaceTitle: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#576561',
    letterSpacing: '0.5px'
  },
  speechPaceBadge: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '8px'
  },
  repeatQuoteCard: {
    backgroundColor: 'rgba(238, 235, 227, 0.4)',
    borderLeft: '4px solid #ca0013',
    borderRadius: '12px',
    padding: '14px 16px'
  },
  verbatimText: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#171e19',
    lineHeight: '1.55'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '28px 12px',
    gap: '12px',
    textAlign: 'center'
  },
  spinner: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid rgba(202, 0, 19, 0.15)',
    borderTopColor: '#ca0013',
    animation: 'spin 0.75s linear infinite'
  },
  loadingText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  loadingBold: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#171e19'
  },
  loadingSub: {
    fontSize: '12px',
    color: '#7b8a86'
  },
  errorContainer: {
    backgroundColor: 'rgba(202, 0, 19, 0.08)',
    border: '1px solid rgba(202, 0, 19, 0.25)',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  errorTitle: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#ca0013'
  },
  errorMsg: {
    fontSize: '12.5px',
    color: '#171e19',
    lineHeight: '1.4'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '28px 16px',
    textAlign: 'center',
    gap: '8px'
  },
  emptyTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#576561'
  },
  emptySub: {
    fontSize: '12.5px',
    color: '#7b8a86',
    maxWidth: '280px',
    lineHeight: '1.4'
  }
};
