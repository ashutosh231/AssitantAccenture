import test from 'node:test';
import assert from 'node:assert/strict';

function isTranscribeRoute(urlString) {
  const url = new URL(urlString);
  const cleanPath = url.pathname.replace(/\/+$/, '') || '/';
  if (cleanPath === '/transcribe' || cleanPath.endsWith('/transcribe')) return true;
  if (url.searchParams.get('mode') === 'transcribe-only' || url.searchParams.get('route') === 'transcribe') return true;
  if (url.hash === '#/transcribe' || url.hash === '#transcribe' || url.hash === '#transcribe-only') return true;
  return false;
}

test('isTranscribeRoute correctly detects /transcribe route', () => {
  assert.equal(isTranscribeRoute('http://localhost:5173/'), false);
  assert.equal(isTranscribeRoute('http://localhost:5173/transcribe'), true);
  assert.equal(isTranscribeRoute('http://localhost:5173/transcribe/'), true);
  assert.equal(isTranscribeRoute('http://localhost:5173/#/transcribe'), true);
  assert.equal(isTranscribeRoute('http://localhost:5173/?mode=transcribe-only'), true);
});

test('isTranscribeRoute returns false for root and other paths', () => {
  assert.equal(isTranscribeRoute('http://localhost:5173/'), false);
  assert.equal(isTranscribeRoute('http://localhost:5173/answer'), false);
});


