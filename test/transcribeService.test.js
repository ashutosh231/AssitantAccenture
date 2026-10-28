import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAudioEventMessage,
  parseEventStreamMessage,
  getSignedTranscribeUrl,
  TranscribeStreamingService,
  DEFAULT_INACTIVITY_TIMEOUT_MS,
  KEEPALIVE_INTERVAL_MS
} from '../src/services/transcribeService.js';
import { crc32, utf8Encode } from '../src/utils/crypto.js';

test('createAudioEventMessage constructs valid AWS EventStream binary frame', () => {
  // Mock 100 bytes of PCM audio
  const mockPcm = new Uint8Array(100);
  for (let i = 0; i < mockPcm.length; i++) {
    mockPcm[i] = i % 256;
  }

  const frameBuffer = createAudioEventMessage(mockPcm);
  const view = new DataView(frameBuffer);
  const bytes = new Uint8Array(frameBuffer);

  const totalLen = view.getUint32(0, false);
  const headersLen = view.getUint32(4, false);
  const preludeCrc = view.getUint32(8, false);

  assert.equal(totalLen, frameBuffer.byteLength);
  assert.equal(totalLen, 16 + headersLen + mockPcm.length);

  // Validate prelude CRC
  const computedPreludeCrc = crc32(bytes.subarray(0, 8));
  assert.equal(preludeCrc, computedPreludeCrc);

  // Validate message CRC
  const expectedMessageCrc = view.getUint32(totalLen - 4, false);
  const computedMessageCrc = crc32(bytes.subarray(0, totalLen - 4));
  assert.equal(expectedMessageCrc, computedMessageCrc);

  // Validate payload bytes placement
  const payloadSlice = bytes.subarray(12 + headersLen, totalLen - 4);
  assert.deepEqual(Array.from(payloadSlice), Array.from(mockPcm));
});

test('parseEventStreamMessage correctly parses JSON payload from EventStream frame', () => {
  const jsonPayload = JSON.stringify({
    Transcript: {
      Results: [
        {
          ResultId: 'res-1234',
          StartTime: 0.2,
          EndTime: 1.5,
          IsPartial: false,
          Alternatives: [{ Transcript: 'Good morning everyone' }]
        }
      ]
    }
  });

  const payloadBytes = utf8Encode(jsonPayload);
  const headersLen = 0;
  const totalLen = 16 + headersLen + payloadBytes.length;

  const buffer = new ArrayBuffer(totalLen);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint32(0, totalLen, false);
  view.setUint32(4, headersLen, false);
  view.setUint32(8, crc32(bytes.subarray(0, 8)), false);

  bytes.set(payloadBytes, 12 + headersLen);
  view.setUint32(totalLen - 4, crc32(bytes.subarray(0, totalLen - 4)), false);

  const parsed = parseEventStreamMessage(buffer);
  assert.equal(parsed.error, null);
  assert.equal(
    parsed.payloadJson.Transcript.Results[0].Alternatives[0].Transcript,
    'Good morning everyone'
  );
  assert.equal(parsed.payloadJson.Transcript.Results[0].IsPartial, false);
});

test('getSignedTranscribeUrl constructs compliant SigV4 WebSocket URL', () => {
  const url = getSignedTranscribeUrl({
    accessKeyId: 'AKIA_TEST_KEY',
    secretAccessKey: 'SECRET_TEST_KEY',
    region: 'us-east-1',
    languageCode: 'en-US',
    sampleRate: 16000
  });

  assert.ok(url.startsWith('wss://transcribestreaming.us-east-1.amazonaws.com:8443/stream-transcription-websocket?'));
  assert.ok(url.includes('X-Amz-Algorithm=AWS4-HMAC-SHA256'));
  assert.ok(url.includes('X-Amz-Credential=AKIA_TEST_KEY'));
  assert.ok(url.includes('language-code=en-US'));
  assert.ok(url.includes('media-encoding=pcm'));
  assert.ok(url.includes('sample-rate=16000'));
  assert.ok(url.includes('X-Amz-Signature='));
});

test('TranscribeStreamingService has 2 minutes (120 seconds) default inactivity timeout', () => {
  assert.equal(DEFAULT_INACTIVITY_TIMEOUT_MS, 120000); // exactly 120 seconds
  assert.equal(KEEPALIVE_INTERVAL_MS, 5000); // 5 seconds heartbeat

  let timedOut = false;
  const service = new TranscribeStreamingService({
    inactivityTimeoutMs: 120000,
    onInactivityTimeout: () => {
      timedOut = true;
    }
  });

  assert.equal(service.inactivityTimeoutMs, 120000);
  assert.equal(typeof service.startKeepAlive, 'function');
  assert.equal(typeof service.sendSilenceFrame, 'function');
});
