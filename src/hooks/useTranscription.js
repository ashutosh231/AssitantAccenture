/**
 * Custom hook for transcription operations and reactive helpers
 */

import { useApp } from '../context/AppContext';
import { formatDuration, countWords, estimateSpeechDuration } from '../utils/transcriptHelpers';

export function useTranscription() {
  const app = useApp();

  return {
    ...app,
    formattedDuration: formatDuration(app.sessionDuration),
    wordCount: countWords(app.liveTranscriptText),
    estimatedDurationSec: estimateSpeechDuration(app.liveTranscriptText)
  };
}
