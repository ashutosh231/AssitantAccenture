import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDuration,
  formatTimeRange,
  countWords,
  estimateSpeechDuration,
  compileTranscriptText,
  appendSegmentDeduplicated
} from '../src/utils/transcriptHelpers.js';

test('formatDuration formats seconds accurately into mm:ss', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(5), '00:05');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3599), '59:59');
});

test('formatTimeRange formats start and end timestamps', () => {
  assert.equal(formatTimeRange(2, 6), '00:02 - 00:06');
  assert.equal(formatTimeRange(0, 0), '00:00');
});

test('countWords accurately calculates word count', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   Hello    world!  '), 2);
  assert.equal(countWords('Tell me about a time you handled a difficult client.'), 10);
});

test('estimateSpeechDuration calculates approximate spoken seconds at 135 wpm', () => {
  // 90 words is about 40 seconds, 100 words is about 44 seconds
  const speech90 = new Array(90).fill('word').join(' ');
  const est90 = estimateSpeechDuration(speech90);
  assert.ok(est90 >= 38 && est90 <= 44);

  const speech100 = new Array(100).fill('word').join(' ');
  const est100 = estimateSpeechDuration(speech100);
  assert.ok(est100 >= 42 && est100 <= 46);
});

test('appendSegmentDeduplicated ignores duplicate resultId or exact duplicate text', () => {
  let segments = [];
  const seg1 = { id: 'seg-1', text: 'Good morning', startTime: 0, endTime: 1 };
  segments = appendSegmentDeduplicated(segments, seg1);
  assert.equal(segments.length, 1);

  // Re-appending with same id updates rather than duplicates
  const seg1Update = { id: 'seg-1', text: 'Good morning everyone', startTime: 0, endTime: 1.5 };
  segments = appendSegmentDeduplicated(segments, seg1Update);
  assert.equal(segments.length, 1);
  assert.equal(segments[0].text, 'Good morning everyone');

  // Appending exact identical text as last segment is skipped
  const segDup = { id: 'seg-2', text: 'Good morning everyone', startTime: 1.5, endTime: 2 };
  segments = appendSegmentDeduplicated(segments, segDup);
  assert.equal(segments.length, 1);

  // Appending new distinct segment succeeds
  const seg2 = { id: 'seg-3', text: 'Please explain your previous project.', startTime: 2, endTime: 4 };
  segments = appendSegmentDeduplicated(segments, seg2);
  assert.equal(segments.length, 2);
});

test('compileTranscriptText combines finalized segments and interim text', () => {
  const segments = [
    { text: 'Describe a situation' },
    { text: 'where you disagreed with a colleague.' }
  ];
  const combined = compileTranscriptText(segments, 'How did you resolve it?');
  assert.equal(combined, 'Describe a situation where you disagreed with a colleague. How did you resolve it?');
});
