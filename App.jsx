import React from 'react';
import { Settings, Sparkles, Radio } from 'lucide-react';
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
    isSettingsOpen,
    setIsSettingsOpen,
    credentialsConfig,
    handleSaveSettings,
    handleClearSettings
  } = useApp();

  const isListening = listeningStatus === 'listening';
  const hasAnswer = !!generatedAnswer;

  return (
    <div className="app-container">
      {/* Native-like Mobile App Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-logo-icon">ACC</div>
          <div>
            <h1 className="brand-title">Accenture Comm Assistant</h1>
            <p className="brand-subtitle">AI Listening & Answer Prep</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Live indicator pill in header */}
          {isListening && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <div className="badge-live-pulse" />
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#34d399' }}>LIVE</span>
            </div>
          )}

          {/* Settings button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn-icon"
            title="AWS & Audio Settings"
            aria-label="Settings"
          >
            <Settings size={18} />
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

      {/* Fixed Bottom Navigation (Exactly 2 Tabs) */}
      <BottomNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isListening={isListening}
        hasAnswer={hasAnswer}
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
