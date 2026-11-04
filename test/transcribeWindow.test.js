import test from 'node:test';
import assert from 'node:assert/strict';

function isTranscribeOnlyMode(urlString) {
  const url = new URL(urlString);
  return (
    url.searchParams.get('mode') === 'transcribe-only' ||
    url.hash === '#transcribe-only'
  );
}

function buildTranscribeOnlyUrl(currentUrlString) {
  const url = new URL(currentUrlString);
  url.searchParams.set('mode', 'transcribe-only');
  return url.toString();
}

function buildFullAppUrl(transcribeOnlyUrlString) {
  const url = new URL(transcribeOnlyUrlString);
  url.searchParams.delete('mode');
  return url.toString();
}

test('isTranscribeOnlyMode correctly detects query parameter and hash', () => {
  assert.equal(isTranscribeOnlyMode('http://localhost:5173/'), false);
  assert.equal(isTranscribeOnlyMode('http://localhost:5173/?mode=transcribe-only'), true);
  assert.equal(isTranscribeOnlyMode('http://localhost:5173/#transcribe-only'), true);
  assert.equal(isTranscribeOnlyMode('http://localhost:5173/?other=1#transcribe-only'), true);
});

test('buildTranscribeOnlyUrl appends mode parameter properly', () => {
  const url = buildTranscribeOnlyUrl('http://localhost:5173/');
  assert.equal(url, 'http://localhost:5173/?mode=transcribe-only');
});

test('buildFullAppUrl removes mode parameter properly to return to full app', () => {
  const fullUrl = buildFullAppUrl('http://localhost:5173/?mode=transcribe-only');
  assert.equal(fullUrl, 'http://localhost:5173/');
});

