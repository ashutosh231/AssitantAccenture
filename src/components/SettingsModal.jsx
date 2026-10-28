import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Check } from 'lucide-react';

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
            <div style={styles.keyCircle}>
              <Key size={18} color="#ffffff" />
            </div>
            <div>
              <span style={styles.headerSubtitle}>PREPARATION SETTINGS</span>
              <h2 style={styles.title}>AWS Configuration</h2>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close settings">
            <X size={20} color="#576561" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={styles.body}>
          {/* Status info banner */}
          <div style={styles.statusBox}>
            <Shield size={18} color="#ca0013" />
            <div style={styles.statusInfo}>
              <span style={styles.statusTitle}>
                AUTH MODE: {credentialsConfig?.source ? credentialsConfig.source.toUpperCase() : 'NOT CONFIGURED'}
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
              Configured: <code>openai.gpt-6.1-terra</code> or <code>amazon.nova-2-lite-v1:0</code>
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
            <button type="submit" className="btn-primary-red">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved!
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
    backgroundColor: 'rgba(23, 30, 25, 0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 100
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '40px',
    border: '1px solid rgba(183, 198, 194, 0.35)',
    width: '100%',
    maxWidth: '420px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 60px rgba(23, 30, 25, 0.25)'
  },
  header: {
    padding: '18px 24px 12px 24px',
    borderBottom: '1px solid rgba(183, 198, 194, 0.25)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  keyCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#171e19',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerSubtitle: {
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#7b8a86',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  title: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#171e19',
    letterSpacing: '-0.3px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px'
  },
  body: {
    padding: '18px 24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  statusBox: {
    backgroundColor: 'rgba(238, 235, 227, 0.7)',
    border: '1px solid rgba(183, 198, 194, 0.3)',
    borderRadius: '16px',
    padding: '12px 14px',
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
    fontSize: '10.5px',
    fontWeight: '800',
    color: '#171e19',
    letterSpacing: '0.6px'
  },
  statusSub: {
    fontSize: '11.5px',
    color: '#576561',
    fontWeight: '600'
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
    fontWeight: '800',
    color: '#171e19'
  },
  input: {
    padding: '10px 14px',
    backgroundColor: 'rgba(238, 235, 227, 0.5)',
    border: '1px solid rgba(183, 198, 194, 0.4)',
    borderRadius: '14px',
    color: '#171e19',
    fontSize: '13.5px',
    fontWeight: '600',
    outline: 'none',
    width: '100%'
  },
  select: {
    padding: '10px 14px',
    backgroundColor: 'rgba(238, 235, 227, 0.5)',
    border: '1px solid rgba(183, 198, 194, 0.4)',
    borderRadius: '14px',
    color: '#171e19',
    fontSize: '13.5px',
    fontWeight: '600',
    outline: 'none',
    width: '100%'
  },
  hint: {
    fontSize: '10.5px',
    color: '#7b8a86',
    fontWeight: '600'
  },
  sectionDivider: {
    marginTop: '4px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(183, 198, 194, 0.25)'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#ca0013',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px',
    gap: '10px'
  },
  btnReset: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(183, 198, 194, 0.4)',
    borderRadius: '9999px',
    color: '#576561',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer'
  }
};
