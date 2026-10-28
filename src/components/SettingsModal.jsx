import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Globe, Cpu, Check, AlertCircle } from 'lucide-react';

export function SettingsModal({
  isOpen,
  onClose,
  credentialsConfig,
  onSaveSettings,
  onClearSettings
}) {
  const [region, setRegion] = useState('us-east-1');
  const [languageCode, setLanguageCode] = useState('en-US');
  const [bedrockModelId, setBedrockModelId] = useState('openai.gpt-6.1-terra');
  const [cognitoPoolId, setCognitoPoolId] = useState('');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [remember, setRemember] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (credentialsConfig) {
      setRegion(credentialsConfig.region || 'us-east-1');
      setLanguageCode(credentialsConfig.languageCode || 'en-US');
      setBedrockModelId(credentialsConfig.bedrockModelId || 'openai.gpt-6.1-terra');
      setCognitoPoolId(credentialsConfig.cognitoPoolId || '');
      if (credentialsConfig.source === 'user_storage') {
        setAccessKeyId(credentialsConfig.accessKeyId || '');
        setSecretAccessKey(credentialsConfig.secretAccessKey || '');
      }
    }
  }, [credentialsConfig, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      region,
      languageCode,
      bedrockModelId,
      cognitoPoolId,
      accessKeyId,
      secretAccessKey,
      remember
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    if (confirm('Clear custom credentials from browser memory?')) {
      onClearSettings();
      setAccessKeyId('');
      setSecretAccessKey('');
      setCognitoPoolId('');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <Key size={18} color="#60a5fa" />
            <h2 style={styles.title}>AWS Configuration</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close settings">
            <X size={18} color="#94a3b8" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={styles.body}>
          {/* Status info banner */}
          <div style={styles.statusBox}>
            <Shield size={16} color="#34d399" />
            <div style={styles.statusInfo}>
              <span style={styles.statusTitle}>
                Active Auth Mode: {credentialsConfig?.source ? credentialsConfig.source.toUpperCase() : 'NOT CONFIGURED'}
              </span>
              <span style={styles.statusSub}>
                {credentialsConfig?.accessKeyId
                  ? 'Credentials loaded and ready for Transcribe & Bedrock.'
                  : 'Enter Cognito Pool ID or test credentials to start.'}
              </span>
            </div>
          </div>

          {/* Cognito Identity Pool ID */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Amazon Cognito Identity Pool ID (Recommended)
            </label>
            <input
              type="text"
              placeholder="us-east-1:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={cognitoPoolId}
              onChange={(e) => setCognitoPoolId(e.target.value)}
              style={styles.input}
            />
            <span style={styles.hint}>
              Provides scoped, temporary STS tokens directly to the phone browser.
            </span>
          </div>

          {/* Region & Language Code */}
          <div style={styles.row}>
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label}>AWS Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={styles.input}
                placeholder="us-east-1"
                required
              />
            </div>
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label}>Transcribe Language</label>
              <select
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                style={styles.select}
              >
                <option value="en-US">en-US (US English)</option>
                <option value="en-IN">en-IN (Indian English)</option>
                <option value="en-GB">en-GB (British English)</option>
                <option value="en-AU">en-AU (Australian)</option>
              </select>
            </div>
          </div>

          {/* Bedrock Model ID */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Amazon Bedrock Model ID</label>
            <input
              type="text"
              value={bedrockModelId}
              onChange={(e) => setBedrockModelId(e.target.value)}
              style={styles.input}
              placeholder="openai.gpt-6.1-terra"
              required
            />
            <span style={styles.hint}>
              Configured model: <code>openai.gpt-6.1-terra</code>
            </span>
          </div>

          {/* Optional Direct IAM Credentials (for personal development) */}
          <div style={styles.sectionDivider}>
            <span style={styles.sectionTitle}>Local Development IAM Keys (Optional)</span>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>AWS Access Key ID</label>
            <input
              type="text"
              placeholder="AKIA..."
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              style={styles.input}
              autoComplete="off"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>AWS Secret Access Key</label>
            <input
              type="password"
              placeholder="Secret Key"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              style={styles.input}
              autoComplete="off"
            />
            <span style={styles.hint}>
              Stored only in browser local memory. Never committed to version control.
            </span>
          </div>

          {/* Actions */}
          <div style={styles.actionsRow}>
            <button type="button" onClick={handleReset} style={styles.btnReset}>
              Clear Keys
            </button>
            <button type="submit" style={styles.btnSave}>
              {savedSuccess ? (
                <>
                  <Check size={14} style={{ marginRight: '6px' }} /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.82)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 90
  },
  modal: {
    backgroundColor: '#0e172a',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    width: '100%',
    maxWidth: '420px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f8fafc'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px'
  },
  body: {
    padding: '18px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  statusBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px'
  },
  statusInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  statusTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#34d399',
    letterSpacing: '0.3px'
  },
  statusSub: {
    fontSize: '11px',
    color: '#94a3b8'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  row: {
    display: 'flex',
    gap: '12px'
  },
  label: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#cbd5e1'
  },
  input: {
    padding: '9px 12px',
    backgroundColor: '#172238',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    color: '#f8fafc',
    fontSize: '13px',
    outline: 'none',
    width: '100%'
  },
  select: {
    padding: '9px 12px',
    backgroundColor: '#172238',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    color: '#f8fafc',
    fontSize: '13px',
    outline: 'none',
    width: '100%'
  },
  hint: {
    fontSize: '10.5px',
    color: '#64748b'
  },
  sectionDivider: {
    marginTop: '6px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#60a5fa',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px',
    gap: '10px'
  },
  btnReset: {
    padding: '8px 14px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    color: '#94a3b8',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  btnSave: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 20px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
  }
};
