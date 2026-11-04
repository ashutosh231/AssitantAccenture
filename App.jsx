import React, { useState, useEffect } from 'react';
import { Mic, ArrowRight, ArrowLeft } from 'lucide-react';
import { AppProvider, useApp } from './src/context/AppContext';
import { BottomNavbar } from './src/components/BottomNavbar';
import { AITranscribeScreen } from './src/screens/AITranscribeScreen';
import { AITextAnswerScreen } from './src/screens/AITextAnswerScreen';
import { SettingsModal } from './src/components/SettingsModal';
import './src/styles/theme.css';

function getIsTranscribeRoute() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/transcribe' || path.endsWith('/transcribe')) return true;
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'transcribe-only' || params.get('route') === 'transcribe') return true;
  if (
    window.location.hash === '#/transcribe' ||
    window.location.hash === '#transcribe' ||
    window.location.hash === '#transcribe-only'
  ) {
    return true;
  }
  return false;
}

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

  // Track whether we are on the /transcribe route
  const [isTranscribeRoute, setIsTranscribeRoute] = useState(getIsTranscribeRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsTranscribeRoute(getIsTranscribeRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
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

  // Client-side route transition without opening a new window
  const navigateTo = (path) => {
    try {
      window.history.pushState({}, '', path);
    } catch {
      window.location.hash = path === '/' ? '' : path;
    }
    setIsTranscribeRoute(getIsTranscribeRoute());
  };

  const handleGoToTranscribe = () => {
    navigateTo('/transcribe');
  };

  const handleGoToFullApp = () => {
    navigateTo('/');
  };

  return (
    <div className={`app-container ${isTranscribeRoute ? 'standalone-mode' : ''}`}>
      {/* Header: Top-aligned with greeting label, title, route toggle button, and profile avatar */}
      <header className="app-header">
        <div className="header-left">
          <span className="header-greeting-label">ACCENTURE ASSESSMENT</span>
          <h1 className="header-title-bold">
            {isTranscribeRoute ? 'Transcribe Service' : 'Comm AI'}
          </h1>
        </div>

        <div className="header-right">
          {/* Button on the left of profile icon to route between / and /transcribe */}
          {!isTranscribeRoute ? (
            <button
              type="button"
              onClick={handleGoToTranscribe}
              className="transcribe-launch-btn"
              title="Go to Transcribe Service (/transcribe)"
              aria-label="Go to Transcribe Service"
            >
              <Mic size={16} className="transcribe-launch-mic" />
              <span className="transcribe-launch-text">Transcribe</span>
              <ArrowRight size={13} className="transcribe-launch-icon" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoToFullApp}
              className="transcribe-launch-btn"
              title="Return to Full Comm AI Application (/)"
              aria-label="Return to Full Comm AI Application"
            >
              <ArrowLeft size={14} />
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
          On /transcribe route, only AITranscribeScreen is rendered as a big box.
          On root / route, both screens stay mounted to preserve Web Audio streams,
          WebSocket connections, and state during tab switching. */}
      <main className="screens-viewport">
        <div
          style={{
            display: (isTranscribeRoute || activeTab === 'transcribe') ? 'flex' : 'none',
            flex: 1,
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <AITranscribeScreen transcribeOnly={isTranscribeRoute} />
        </div>

        {!isTranscribeRoute && (
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

      {/* Floating Navigation Pill with Center Action FAB - only shown on root full app route */}
      {!isTranscribeRoute && (
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
