import React from 'react';
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

  return (
    <div className="app-container">
      {/* Header: Top-aligned with greeting label and 30px bold name, plus 48px avatar */}
      <header className="app-header">
        <div className="header-left">
          <span className="header-greeting-label">ACCENTURE ASSESSMENT</span>
          <h1 className="header-title-bold">Comm AI</h1>
        </div>

        <div className="header-right">
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
          Both screens stay mounted to preserve Web Audio streams,
          WebSocket connections, and state during tab switching. */}
      <main className="screens-viewport">
        <div
          style={{
            display: activeTab === 'transcribe' ? 'flex' : 'none',
            flex: 1,
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <AITranscribeScreen />
        </div>

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
      </main>

      {/* Floating Navigation Pill with Center Action FAB */}
      <BottomNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isListening={isListening}
        hasContent={hasContent}
        onCenterAction={handleCenterAction}
      />

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
