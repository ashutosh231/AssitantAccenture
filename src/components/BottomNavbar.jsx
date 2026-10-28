import React from 'react';
import { Mic, Sparkles, Send } from 'lucide-react';

export function BottomNavbar({
  activeTab,
  onTabChange,
  isListening,
  hasContent,
  onCenterAction
}) {
  return (
    <div className="floating-navbar-wrapper">
      <nav className="floating-nav-pill" role="navigation" aria-label="Main Navigation">
        {/* Left Tab: AI Transcribe (48px touch target) */}
        <button
          onClick={() => onTabChange('transcribe')}
          className={`nav-tab-touch ${activeTab === 'transcribe' ? 'active' : ''}`}
          aria-selected={activeTab === 'transcribe'}
          role="tab"
          title="AI Transcribe Screen"
        >
          <Mic size={20} color={activeTab === 'transcribe' ? '#ffffff' : '#b7c6c2'} />
          <span className="nav-tab-text">Transcribe</span>
        </button>

        {/* Center Floating Action Button (FAB): 56px red circle offset vertically by -32px, 4px #eeebe3 border */}
        <button
          onClick={onCenterAction}
          className="floating-center-fab"
          title="Send Captured Speech to AI"
          aria-label="Send to AI"
        >
          <Sparkles size={24} color="#ffffff" />
        </button>

        {/* Right Tab: AI Text Answer (48px touch target) */}
        <button
          onClick={() => onTabChange('answer')}
          className={`nav-tab-touch ${activeTab === 'answer' ? 'active' : ''}`}
          aria-selected={activeTab === 'answer'}
          role="tab"
          title="AI Text Answer Screen"
        >
          <Send size={20} color={activeTab === 'answer' ? '#ffffff' : '#b7c6c2'} />
          <span className="nav-tab-text">Answer</span>
        </button>
      </nav>
    </div>
  );
}
