import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCw,
  Sparkles,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle,
  HelpCircle,
  Gauge,
  BookOpen,
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

  // Emoji map for the 64x64px icon holder
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
            <div style={{ ...styles.bentoOutputCard, backgroundColor: 'rgba(238, 235, 227, 0.6)' }}>
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
              {wordCount} / 90-120 Words ({isTargetMet ? 'Perfect Pace' : 'Adjust Delivery'})
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
    <div className="hero-card">
      {/* 1. Semi-transparent decorative blob (#b7c6c2/20) in the top-right */}
      <div className="decorative-blob" />

      {/* Top Header Row with 64x64px white icon holder and Actions */}
      <div className="hero-top-row">
        <div className="icon-holder-64">{currentEmoji}</div>

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
              style={{ padding: '8px 16px', fontSize: '13px' }}
              title="Regenerate answer"
            >
              <RotateCw size={14} className={isLoading ? 'spin-icon' : ''} />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      </div>

      {/* Title & Subheading */}
      <div style={styles.heroTitleGroup}>
        <span style={styles.heroCategoryLabel}>SELECTED ASSESSMENT</span>
        <h2 style={styles.heroHeading}>{selectedType}</h2>
      </div>

      {/* 3. Nested 2-column Grid for Bento Metrics */}
      <div className="bento-metric-grid">
        {/* Bento Metric 1 */}
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

        {/* Bento Metric 2 */}
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

      {/* Main Content Area */}
      <div style={styles.bodyArea}>
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

        {isError && (
          <div style={styles.errorContainer}>
            <div style={styles.errorHeader}>
              <AlertTriangle size={18} color="#ca0013" />
              <span style={styles.errorTitle}>Generation Interrupted</span>
            </div>
            <p style={styles.errorMsg}>{error}</p>
            <button onClick={onRegenerate} className="btn-primary-red" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              <RotateCw size={14} /> Retry
            </button>
          </div>
        )}

        {!isLoading && answer && renderFormattedAssessmentOutput()}

        {!isLoading && !answer && !isError && (
          <div style={styles.emptyContainer}>
            <FileText size={36} color="#b7c6c2" />
            <p style={styles.emptyTitle}>Ready for assessment question</p>
            <p style={styles.emptySub}>
              Switch to <strong>AI Transcribe</strong> to capture laptop speech, or tap the red Center Action button.
            </p>
            {hasSnapshot && (
              <button onClick={onGetAnswer} className="btn-primary-red" style={{ marginTop: '8px' }}>
                <Sparkles size={16} /> Get Answer for Snapshot
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Alert / Info box at bottom using #b7c6c2/20 background */}
      <div className="hero-alert-box">
        <HelpCircle size={18} color="#576561" style={{ flexShrink: 0 }} />
        <span className="hero-alert-text">
          {selectedType === '45-Second Speech' &&
            'Practice speaking naturally with a crisp opening, 2-3 points, and a concluding sentence.'}
          {selectedType === 'Read Aloud' &&
            'Deliver this text with clear articulation and natural pauses at commas and periods.'}
          {selectedType === 'Repeat What You Hear' &&
            'Repeat the sentence verbatim with the exact words and sentence cadence.'}
          {selectedType === 'Correct the Wrong Sentence' &&
            'Speak the corrected sentence clearly, then provide the concise grammatical rule.'}
          {selectedType === 'Fill in the Blanks' &&
            'Insert the missing term smoothly into the sentence structure.'}
          {selectedType === 'Scenario-Based Reply' &&
            'Emphasize active collaboration, accountability, and practical problem solving.'}
          {selectedType === 'Situation-Based Answer' &&
            'Provide a logical, structured response directly answering the core scenario.'}
        </span>
      </div>
    </div>
  );
}

const styles = {
  actionButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    zIndex: 3
  },
  heroTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    position: 'relative',
    zIndex: 2
  },
  heroCategoryLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#7b8a86',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  heroHeading: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#171e19',
    letterSpacing: '-0.4px',
    lineHeight: '1.2'
  },
  bodyArea: {
    minHeight: '130px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2
  },
  standardAnswerContainer: {
    padding: '4px 0'
  },
  standardAnswerText: {
    fontSize: '15px',
    fontWeight: '600',
    lineHeight: '1.65',
    color: '#171e19',
    whiteSpace: 'pre-wrap',
    userSelect: 'text'
  },
  assessmentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  bentoOutputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    lineHeight: '1.4'
  },
  explanationText: {
    fontSize: '13px',
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
    marginBottom: '8px'
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
    backgroundColor: 'rgba(23, 30, 25, 0.04)',
    borderLeft: '4px solid #ca0013',
    borderRadius: '12px',
    padding: '12px 14px'
  },
  verbatimText: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#171e19',
    lineHeight: '1.5'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 12px',
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
