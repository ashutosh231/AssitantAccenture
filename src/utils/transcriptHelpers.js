/**
 * Transcript Helper Utilities
 */

/**
 * Format seconds into mm:ss format
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format start and end timestamp in seconds to mm:ss - mm:ss
 * @param {number} start
 * @param {number} end
 * @returns {string}
 */
export function formatTimeRange(start, end) {
  if (start == null && end == null) return '';
  const s = formatDuration(start || 0);
  if (end == null || end === start) return s;
  return `${s} - ${formatDuration(end)}`;
}

/**
 * Count words in a string
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimate speech duration in seconds assuming 130-150 words per minute
 * (Accenture standard speaking pace: approx 100 words in 45 seconds = ~133 wpm)
 * @param {string} text
 * @returns {number} estimated seconds
 */
export function estimateSpeechDuration(text) {
  const words = countWords(text);
  if (words === 0) return 0;
  return Math.round((words / 135) * 60);
}

/**
 * Clean and combine finalized segments into single unified text
 * @param {Array<{ text: string }>} segments
 * @param {string} [interimText='']
 * @returns {string}
 */
export function compileTranscriptText(segments = [], interimText = '') {
  const finalized = segments
    .map((s) => s.text?.trim())
    .filter(Boolean)
    .join(' ');

  const interim = interimText?.trim();
  if (!interim) return finalized;
  if (!finalized) return interim;
  return `${finalized} ${interim}`;
}

/**
 * Deduplicate segments by resultId and normalized text
 * @param {Array} existingSegments
 * @param {Object} newSegment
 * @returns {Array} updated segments
 */
export function appendSegmentDeduplicated(existingSegments, newSegment) {
  if (!newSegment || !newSegment.text?.trim()) return existingSegments;

  const normalizedNewText = newSegment.text.trim().toLowerCase();

  // If resultId matches existing segment, update or skip
  const existingIndex = newSegment.id
    ? existingSegments.findIndex((s) => s.id === newSegment.id)
    : -1;

  if (existingIndex >= 0) {
    const updated = [...existingSegments];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...newSegment,
      text: newSegment.text.trim()
    };
    return updated;
  }

  // Check if last segment has identical text (AWS sometimes re-sends final segment)
  if (existingSegments.length > 0) {
    const last = existingSegments[existingSegments.length - 1];
    if (last.text.trim().toLowerCase() === normalizedNewText) {
      return existingSegments; // Skip exact duplicate
    }
  }

  return [...existingSegments, { ...newSegment, text: newSegment.text.trim() }];
}
