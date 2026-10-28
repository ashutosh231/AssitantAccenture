import React, { useState } from 'react';
import { Copy, Check, RotateCw, Sparkles, Clock, AlertTriangle, FileText } from 'lucide-react';
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

  return (
    <div style={styles.cardContainer}>
      {/* Top action bar */}
      <div style={styles.cardHeader}>
        <div style={styles.headerTitleGroup}>
          <Sparkles size={16} color="#c084fc" />
          <span style={styles.headerTitle}>Suggested Response</span>
        </div>

        <div style={styles.actionButtons}>
          {answer && (
            <button
              onClick={handleCopy}
              style={{
                ...styles.btnAction,
                color: copied ? '#34d399' : '#cbd5e1'
              }}
              title="Copy response to clipboard"
            >
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          {hasSnapshot && (
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              style={{
                ...styles.btnAction,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              title="Regenerate answer for this question"
            >
              <RotateCw size={14} className={isLoading ? 'spin-icon' : ''} />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      </div>

      {/* Answer Body / States */}
      <div style={styles.cardBody}>
        {isLoading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <div style={styles.loadingTextGroup}>
              <span style={styles.loadingTitle}>Bedrock is crafting your answer...</span>
              <span style={styles.loadingSub}>
                Applying {selectedType} scoring criteria using openai.gpt-6.1-terra
              </span>
            </div>
          </div>
        )}

        {isError && (
          <div style={styles.errorBox}>
            <div style={styles.errorHeader}>
              <AlertTriangle size={16} color="#ef4444" />
              <span style={styles.errorTitle}>Generation Error</span>
            </div>
            <p style={styles.errorText}>{error}</p>
            <div style={styles.errorActionRow}>
              <button onClick={onRegenerate} style={styles.retryBtn}>
                <RotateCw size={13} style={{ marginRight: '5px' }} />
                Retry Request
              </button>
            </div>
          </div>
        )}

        {!isLoading && answer && (
          <div style={styles.answerTextContainer}>
            <p style={styles.answerText}>{answer}</p>
          </div>
        )}

        {!isLoading && !answer && !isError && (
          <div style={styles.emptyState}>
            <FileText size={32} color="#334155" />
            <p style={styles.emptyTitle}>Ready for assessment question</p>
            <p style={styles.emptySub}>
              Capture your laptop's audio on the AI Transcribe tab and tap <strong>Send to AI</strong>.
            </p>
            {hasSnapshot && (
              <button onClick={onGetAnswer} style={styles.getAnswerBtn}>
                <Sparkles size={14} style={{ marginRight: '6px' }} />
                Get Answer for Current Snapshot
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics (Word count & Spoken duration for 45s Speech) */}
      {answer && !isLoading && (
        <div style={styles.cardFooter}>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>WORDS</span>
            <span
              style={{
                ...styles.metricValue,
                color:
                  selectedType === '45-Second Speech'
                    ? wordCount >= 85 && wordCount <= 125
                      ? '#34d399'
                      : '#fbbf24'
                    : '#f1f5f9'
              }}
            >
              {wordCount}
              {selectedType === '45-Second Speech' && (
                <span style={styles.targetPill}> (Goal: 90-120)</span>
              )}
            </span>
          </div>

          <div style={styles.metricItem}>
            <Clock size={12} color="#94a3b8" />
            <span style={styles.metricLabel}>EST. SPEAKING TIME</span>
            <span style={styles.metricValue}>~{estSeconds}s</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  cardContainer: {
    backgroundColor: '#0f172a',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
  },
  cardHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(23, 34, 57, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  headerTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#e2e8f0',
    letterSpacing: '-0.1px'
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#cbd5e1',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  cardBody: {
    padding: '16px',
    minHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  answerTextContainer: {
    whiteSpace: 'pre-wrap'
  },
  answerText: {
    fontSize: '15px',
    lineHeight: '1.65',
    color: '#f8fafc',
    userSelect: 'text',
    letterSpacing: '0.1px'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 12px',
    gap: '14px',
    textAlign: 'center'
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid rgba(139, 92, 246, 0.2)',
    borderTopColor: '#c084fc',
    animation: 'spin 0.8s linear infinite'
  },
  loadingTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  loadingTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9'
  },
  loadingSub: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
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
    fontSize: '13px',
    fontWeight: '700',
    color: '#f87171'
  },
  errorText: {
    fontSize: '12.5px',
    lineHeight: '1.5',
    color: '#fca5a5'
  },
  errorActionRow: {
    marginTop: '6px',
    display: 'flex',
    justifyContent: 'flex-start'
  },
  retryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '28px 16px',
    textAlign: 'center',
    gap: '8px'
  },
  emptyTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  emptySub: {
    fontSize: '12px',
    color: '#64748b',
    maxWidth: '280px',
    lineHeight: '1.4'
  },
  getAnswerBtn: {
    marginTop: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
  },
  cardFooter: {
    padding: '10px 16px',
    backgroundColor: 'rgba(10, 16, 28, 0.7)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  metricLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.4px'
  },
  metricValue: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#f8fafc'
  },
  targetPill: {
    fontSize: '10.5px',
    fontWeight: '500',
    color: '#a78bfa'
  }
};
