import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

export function BottomNavbar({ activeTab, onTabChange, isListening, hasAnswer }) {
  return (
    <nav className="bottom-navbar" role="navigation" aria-label="Main Navigation">
      {/* Tab 1: AI Transcribe */}
      <button
        onClick={() => onTabChange('transcribe')}
        className={`nav-tab-btn transcribe-tab ${activeTab === 'transcribe' ? 'active' : ''}`}
        aria-selected={activeTab === 'transcribe'}
        role="tab"
      >
        {activeTab === 'transcribe' && <div className="nav-tab-indicator blue" />}
        <div style={styles.iconWrapper}>
          <Mic size={20} />
          {isListening && <div style={styles.tabLiveDot} />}
        </div>
        <span className="nav-tab-label">AI Transcribe</span>
      </button>

      {/* Tab 2: AI Text Answer */}
      <button
        onClick={() => onTabChange('answer')}
        className={`nav-tab-btn answer-tab ${activeTab === 'answer' ? 'active' : ''}`}
        aria-selected={activeTab === 'answer'}
        role="tab"
      >
        {activeTab === 'answer' && <div className="nav-tab-indicator purple" />}
        <div style={styles.iconWrapper}>
          <Sparkles size={20} />
          {hasAnswer && <div style={styles.tabAnswerDot} />}
        </div>
        <span className="nav-tab-label">AI Text Answer</span>
      </button>
    </nav>
  );
}

const styles = {
  iconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px'
  },
  tabLiveDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 6px #10b981'
  },
  tabAnswerDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#a855f7',
    boxShadow: '0 0 6px #a855f7'
  }
};

