/**
 * Global Application Context & State Management
 * Coordinates audio capture, live transcription streaming, Bedrock answer generation,
 * shared transcript state, and persistent settings.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AudioCaptureService } from '../services/audioCapture';
import { TranscribeStreamingService } from '../services/transcribeService';
import { generateBedrockAnswer, ASSESSMENT_TYPES } from '../services/bedrockService';
import { getAwsCredentials, saveCustomCredentials, clearCustomCredentials } from '../services/awsCredentials';
import { appendSegmentDeduplicated, compileTranscriptText } from '../utils/transcriptHelpers';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation: 'transcribe' | 'answer'
  const [activeTab, setActiveTab] = useState('transcribe');

  // Transcription State
  const [listeningStatus, setListeningStatus] = useState('idle'); // 'idle' | 'connecting' | 'listening' | 'paused' | 'error'
  const [finalizedSegments, setFinalizedSegments] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [transcribeError, setTranscribeError] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState({ volume: 0, frequencyData: new Uint8Array(32) });

  // Bedrock AI Answer State
  const [submittedSnapshot, setSubmittedSnapshot] = useState(null); // { text, timestamp, segmentsCount }
  const [selectedAssessmentType, setSelectedAssessmentType] = useState('Scenario-Based Reply');
  const [generatedAnswer, setGeneratedAnswer] = useState(null);
  const [bedrockStatus, setBedrockStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [bedrockError, setBedrockError] = useState(null);
  const isSubmittingRef = useRef(false);

  // AWS Configuration State
  const [credentialsConfig, setCredentialsConfig] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // References to keep services alive across tab switches
  const audioCaptureRef = useRef(null);
  const transcribeServiceRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const finalizedSegmentsRef = useRef(finalizedSegments);
  finalizedSegmentsRef.current = finalizedSegments;
  const interimTranscriptRef = useRef(interimTranscript);
  interimTranscriptRef.current = interimTranscript;

  // Load initial credentials config
  const refreshCredentials = useCallback(async () => {
    try {
      const creds = await getAwsCredentials();
      setCredentialsConfig(creds);
      return creds;
    } catch (err) {
      console.warn('Failed loading initial credentials:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshCredentials();
  }, [refreshCredentials]);

  // Session duration timer
  useEffect(() => {
    if (listeningStatus === 'listening') {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
      timerIntervalRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else if (listeningStatus === 'paused') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else if (listeningStatus === 'idle') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [listeningStatus, sessionStartTime]);

  /**
   * Handle incoming interim text
   */
  const handleInterimResult = useCallback((item) => {
    setInterimTranscript(item.text);
  }, []);

  /**
   * Handle incoming finalized segment
   */
  const handleFinalResult = useCallback((segment) => {
    setFinalizedSegments((prev) => appendSegmentDeduplicated(prev, segment));
    setInterimTranscript('');
  }, []);

  /**
   * Start or resume live listening & transcription
   */
  const startListening = useCallback(async () => {
    setTranscribeError(null);

    try {
      // 1. Get AWS credentials
      const creds = await refreshCredentials();
      if (!creds || !creds.accessKeyId || !creds.secretAccessKey) {
        setIsSettingsOpen(true);
        throw new Error('Please configure your AWS Credentials or Cognito Identity Pool ID in Settings.');
      }

      // 2. Initialize Transcribe Streaming Service if needed
      if (!transcribeServiceRef.current) {
        transcribeServiceRef.current = new TranscribeStreamingService({
          onInterimResult: handleInterimResult,
          onFinalResult: handleFinalResult,
          onError: (err) => {
            console.error('Transcribe error:', err);
            setTranscribeError(err.message || 'Transcription error occurred.');
            setListeningStatus('error');
          },
          onStatusChange: (status) => {
            setListeningStatus(status);
          }
        });
      }

      // Connect WebSocket
      transcribeServiceRef.current.connect(creds);

      // 3. Initialize Audio Capture
      if (!audioCaptureRef.current) {
        audioCaptureRef.current = new AudioCaptureService({
          onAudioChunk: (pcmBytes) => {
            transcribeServiceRef.current?.sendAudioChunk(pcmBytes);
          },
          onAudioLevel: (levelData) => {
            setAudioLevel(levelData);
          },
          onError: (err) => {
            console.error('Audio capture error:', err);
            setTranscribeError(err.message || 'Microphone capture error.');
            setListeningStatus('error');
          }
        });
      }

      await audioCaptureRef.current.start();
      setListeningStatus('listening');
    } catch (err) {
      setListeningStatus('error');
      setTranscribeError(err.message);
    }
  }, [handleFinalResult, handleInterimResult, refreshCredentials]);

  /**
   * Pause listening & audio streaming
   */
  const pauseListening = useCallback(() => {
    if (audioCaptureRef.current) {
      audioCaptureRef.current.pause();
    }
    if (transcribeServiceRef.current) {
      transcribeServiceRef.current.pause();
    }
    setListeningStatus('paused');
    setAudioLevel({ volume: 0, frequencyData: new Uint8Array(32) });
  }, []);

  /**
   * Resume listening after pause
   */
  const resumeListening = useCallback(async () => {
    setTranscribeError(null);
    try {
      const creds = await refreshCredentials();
      if (transcribeServiceRef.current) {
        transcribeServiceRef.current.resume(creds);
      }
      if (audioCaptureRef.current) {
        await audioCaptureRef.current.resume();
      }
      setListeningStatus('listening');
    } catch (err) {
      setTranscribeError(err.message);
      setListeningStatus('error');
    }
  }, [refreshCredentials]);

  /**
   * Toggle between Start / Pause / Resume
   */
  const togglePlayPause = useCallback(() => {
    if (listeningStatus === 'listening') {
      pauseListening();
    } else if (listeningStatus === 'paused') {
      resumeListening();
    } else {
      startListening();
    }
  }, [listeningStatus, pauseListening, resumeListening, startListening]);

  /**
   * Start a fresh transcription session (resets transcript & timer)
   */
  const newTranscript = useCallback(() => {
    setFinalizedSegments([]);
    setInterimTranscript('');
    setSessionDuration(0);
    setSessionStartTime(Date.now());
    setTranscribeError(null);
    if (transcribeServiceRef.current) {
      transcribeServiceRef.current.processedResultIds.clear();
    }
  }, []);

  /**
   * Clear the live displayed transcript only
   * (Preserves submittedSnapshot and generatedAnswer)
   */
  const clearTranscript = useCallback(() => {
    setFinalizedSegments([]);
    setInterimTranscript('');
    setTranscribeError(null);
  }, []);

  /**
   * Submit current snapshot to Bedrock AI Answer
   */
  const submitToBedrock = useCallback(
    async (snapshotTextOverride = null, assessmentTypeOverride = null) => {
      if (isSubmittingRef.current) return;

      const targetText =
        snapshotTextOverride ||
        compileTranscriptText(finalizedSegmentsRef.current, interimTranscriptRef.current);

      if (!targetText || !targetText.trim()) {
        setBedrockError('No transcript captured yet. Wait for speech to transcribe or capture audio first.');
        return;
      }

      const currentType = assessmentTypeOverride || selectedAssessmentType;

      // Create immutable snapshot
      const snapshot = {
        text: targetText.trim(),
        timestamp: Date.now(),
        segmentsCount: finalizedSegmentsRef.current.length,
        assessmentType: currentType
      };

      setSubmittedSnapshot(snapshot);
      setBedrockStatus('loading');
      setBedrockError(null);
      isSubmittingRef.current = true;

      try {
        const creds = await refreshCredentials();
        const answer = await generateBedrockAnswer({
          transcriptText: snapshot.text,
          assessmentType: currentType,
          credentials: creds
        });

        setGeneratedAnswer(answer);
        setBedrockStatus('success');
      } catch (err) {
        console.error('Bedrock generation failed:', err);
        setBedrockError(err.message || 'Failed to generate answer from Amazon Bedrock.');
        setBedrockStatus('error');
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [refreshCredentials, selectedAssessmentType]
  );

  /**
   * Send to AI button handler:
   * Takes immutable snapshot, triggers Bedrock, switches to Answer tab
   */
  const handleSendToAI = useCallback(() => {
    const fullText = compileTranscriptText(finalizedSegments, interimTranscript);
    if (!fullText || !fullText.trim()) {
      alert('The transcript is currently empty. Please capture speech from the laptop first.');
      return;
    }

    submitToBedrock(fullText);
    setActiveTab('answer');
  }, [finalizedSegments, interimTranscript, submitToBedrock]);

  /**
   * Regenerate Answer with same snapshot & selected type
   */
  const handleRegenerate = useCallback(() => {
    if (!submittedSnapshot?.text) return;
    submitToBedrock(submittedSnapshot.text, selectedAssessmentType);
  }, [selectedAssessmentType, submittedSnapshot, submitToBedrock]);

  /**
   * Change assessment type
   */
  const handleSelectAssessmentType = useCallback((type) => {
    setSelectedAssessmentType(type);
  }, []);

  /**
   * Save settings
   */
  const handleSaveSettings = useCallback(
    (newConfig) => {
      saveCustomCredentials(newConfig);
      refreshCredentials();
      setIsSettingsOpen(false);
    },
    [refreshCredentials]
  );

  /**
   * Clear settings
   */
  const handleClearSettings = useCallback(() => {
    clearCustomCredentials();
    refreshCredentials();
  }, [refreshCredentials]);

  // Total word count in live transcript
  const liveTranscriptText = compileTranscriptText(finalizedSegments, interimTranscript);

  const value = {
    // Navigation
    activeTab,
    setActiveTab,

    // Audio & Transcription
    listeningStatus,
    finalizedSegments,
    interimTranscript,
    liveTranscriptText,
    transcribeError,
    sessionDuration,
    audioLevel,
    startListening,
    pauseListening,
    resumeListening,
    togglePlayPause,
    newTranscript,
    clearTranscript,

    // Bedrock & Answers
    submittedSnapshot,
    selectedAssessmentType,
    setSelectedAssessmentType: handleSelectAssessmentType,
    generatedAnswer,
    bedrockStatus,
    bedrockError,
    handleSendToAI,
    handleRegenerate,
    submitToBedrock,

    // Settings & Credentials
    credentialsConfig,
    isSettingsOpen,
    setIsSettingsOpen,
    handleSaveSettings,
    handleClearSettings,
    refreshCredentials
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
