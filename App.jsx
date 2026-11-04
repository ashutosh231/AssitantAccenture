import React, { useState, useEffect } from 'react';
import { Mic, ExternalLink, Layers } from 'lucide-react';
import { AppProvider, useApp } from './src/context/AppContext';
import { BottomNavbar } from './src/components/BottomNavbar';
import { AITranscribeScreen } from './src/screens/AITranscribeScreen';
import { AITextAnswerScreen } from './src/screens/AITextAnswerScreen';
import { SettingsModal } from './src/components/SettingsModal';
import './src/styles/theme.css';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    listeningStatus,
    generatedAnswer,
    liveTranscriptText,
    isSettingsOpen,
    setIsSettingsOpen,
    credentialsConfig,
    handleSaveSettings,
    handleClearSettings,
    handleSendToAI
  } = useApp();

  // Check if current view is standalone transcribe-only mode
  const [isTranscribeOnly, setIsTranscribeOnly] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'transcribe-only' || window.location.hash === '#transcribe-only';
    }
    return false;
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      setIsTranscribeOnly(params.get('mode') === 'transcribe-only' || window.location.hash === '#transcribe-only');
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const isListening = listeningStatus === 'listening';
  const hasContent = !!liveTranscriptText?.trim();

  // Handle center floating FAB click
  const handleCenterAction = () => {
    if (activeTab === 'transcribe') {
      handleSendToAI();
    } else {
      setActiveTab('transcribe');
    }
  };

  // Launch standalone transcribe service in a new window/tab
  const handleOpenTranscribeWindow = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'transcribe-only');

    // Attempt opening a focused desktop companion window centered on the screen
    const popupWidth = 480;
    const popupHeight = 840;
    const left = typeof window.screen !== 'undefined' ? Math.round((window.screen.width - popupWidth) / 2) : 100;
    const top = typeof window.screen !== 'undefined' ? Math.round((window.screen.height - popupHeight) / 2) : 100;

    const windowFeatures = `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes`;
    const newWindow = window.open(url.toString(), 'AccentureCommAITranscribe', windowFeatures);

    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback in case popup features were blocked by the browser
      window.open(url.toString(), '_blank');
    } else {
      newWindow.focus();
    }
  };

  // Return to full multi-screen Comm AI experience
  const handleOpenFullApp = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    window.location.href = url.pathname + (url.search ? url.search : '');
  };

  return (
    <div className={`app-container ${isTranscribeOnly ? 'standalone-mode' : ''}`}>
      {/* Header: Top-aligned with greeting label, title, transcribe launch button, and profile avatar */}
      <header className="app-header">
        <div className="header-left">
          <span className="header-greeting-label">ACCENTURE ASSESSMENT</span>
          <h1 className="header-title-bold">
            {isTranscribeOnly ? 'Transcribe Service' : 'Comm AI'}
          </h1>
        </div>

        <div className="header-right">
          {/* Button on the left of profile icon to redirect to standalone transcribe window */}
          {!isTranscribeOnly ? (
            <button
              type="button"
              onClick={handleOpenTranscribeWindow}
              className="transcribe-launch-btn"
              title="Open Transcribe Service in New Window"
              aria-label="Open Transcribe Service in New Window"
            >
              <Mic size={16} className="transcribe-launch-mic" />
              <span className="transcribe-launch-text">Transcribe</span>
              <ExternalLink size={12} className="transcribe-launch-icon" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenFullApp}
              className="transcribe-launch-btn"
              title="Switch to Full Comm AI Application"
              aria-label="Switch to Full Comm AI Application"
            >
              <Layers size={15} />
              <span className="transcribe-launch-text">Full App</span>
            </button>
          )}

          {/* 48px circular profile with 2px white border and 16px red notification badge */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="avatar-wrapper"
            title="Configure AWS & Audio Settings"
            aria-label="Settings"
          >
            <span className="avatar-initials">AC</span>
            <div className={`avatar-badge-red ${isListening ? 'live' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Screen Viewport:
          In transcribe-only mode, only AITranscribeScreen is rendered.
          In full mode, both screens stay mounted to preserve Web Audio streams,
          WebSocket connections, and state during tab switching. */}
      <main className="screens-viewport">
        <div
          style={{
            display: (isTranscribeOnly || activeTab === 'transcribe') ? 'flex' : 'none',
            flex: 1,
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <AITranscribeScreen transcribeOnly={isTranscribeOnly} />
        </div>

        {!isTranscribeOnly && (
          <div
            style={{
              display: activeTab === 'answer' ? 'flex' : 'none',
              flex: 1,
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <AITextAnswerScreen />
          </div>
        )}
      </main>

      {/* Floating Navigation Pill with Center Action FAB - only shown in full application mode */}
      {!isTranscribeOnly && (
        <BottomNavbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isListening={isListening}
          hasContent={hasContent}
          onCenterAction={handleCenterAction}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        credentialsConfig={credentialsConfig}
        onSaveSettings={handleSaveSettings}
        onClearSettings={handleClearSettings}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
