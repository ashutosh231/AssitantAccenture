/**
 * Amazon Transcribe Streaming WebSocket Service
 * Implements real-time bidirectional WebSocket streaming using AWS SigV4 query signing
 * and the AWS EventStream binary wire protocol.
 */

import {
  crc32,
  sha256HexSync,
  hmacSha256Sync,
  toHex,
  utf8Encode,
  utf8Decode
} from '../utils/crypto.js';

/**
 * Encode an AWS EventStream string header
 * Format:
 * - name length: 1 byte
 * - name: utf-8 bytes
 * - type: 1 byte (7 = String)
 * - value length: 2 bytes uint16 BE
 * - value: utf-8 bytes
 */
function encodeStringHeader(name, value) {
  const nameBytes = utf8Encode(name);
  const valBytes = utf8Encode(value);
  const total = 1 + nameBytes.length + 1 + 2 + valBytes.length;
  const buf = new Uint8Array(total);
  let offset = 0;

  buf[offset++] = nameBytes.length;
  buf.set(nameBytes, offset);
  offset += nameBytes.length;

  buf[offset++] = 7; // type 7 = String

  buf[offset++] = (valBytes.length >> 8) & 0xff;
  buf[offset++] = valBytes.length & 0xff;
  buf.set(valBytes, offset);

  return buf;
}

/**
 * Pre-build fixed headers for AudioEvent
 */
const H_CONTENT_TYPE = encodeStringHeader(':content-type', 'application/octet-stream');
const H_EVENT_TYPE = encodeStringHeader(':event-type', 'AudioEvent');
const H_MSG_TYPE = encodeStringHeader(':message-type', 'event');

const FIXED_HEADERS_LEN = H_CONTENT_TYPE.length + H_EVENT_TYPE.length + H_MSG_TYPE.length;
const FIXED_HEADERS = new Uint8Array(FIXED_HEADERS_LEN);
let hOff = 0;
FIXED_HEADERS.set(H_CONTENT_TYPE, hOff);
hOff += H_CONTENT_TYPE.length;
FIXED_HEADERS.set(H_EVENT_TYPE, hOff);
hOff += H_EVENT_TYPE.length;
FIXED_HEADERS.set(H_MSG_TYPE, hOff);

/**
 * Wrap raw PCM bytes in an AWS EventStream frame
 * @param {Uint8Array} pcmBytes
 * @returns {ArrayBuffer}
 */
export function createAudioEventMessage(pcmBytes) {
  const payloadLen = pcmBytes.length;
  const headersLen = FIXED_HEADERS_LEN;
  // 4 (totalLen) + 4 (headersLen) + 4 (preludeCRC) + headersLen + payloadLen + 4 (messageCRC)
  const totalLen = 16 + headersLen + payloadLen;

  const buffer = new ArrayBuffer(totalLen);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // Prelude (8 bytes)
  view.setUint32(0, totalLen, false); // big-endian
  view.setUint32(4, headersLen, false);

  // Prelude CRC (CRC32 of first 8 bytes)
  const preludeCrc = crc32(bytes.subarray(0, 8));
  view.setUint32(8, preludeCrc, false);

  // Headers
  bytes.set(FIXED_HEADERS, 12);

  // Payload
  bytes.set(pcmBytes, 12 + headersLen);

  // Message CRC (CRC32 of all bytes up to messageCRC)
  const messageCrc = crc32(bytes.subarray(0, totalLen - 4));
  view.setUint32(totalLen - 4, messageCrc, false);

  return buffer;
}

/**
 * Parse incoming AWS EventStream frame
 * @param {ArrayBuffer} buffer
 * @returns {{ headers: Object, payloadJson: Object|null, error: string|null }}
 */
export function parseEventStreamMessage(buffer) {
  try {
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    if (buffer.byteLength < 16) {
      return { headers: {}, payloadJson: null, error: 'Frame too small' };
    }

    const totalLen = view.getUint32(0, false);
    const headersLen = view.getUint32(4, false);

    // Payload slice
    const payloadStart = 12 + headersLen;
    const payloadEnd = totalLen - 4;

    if (payloadEnd <= payloadStart) {
      return { headers: {}, payloadJson: null, error: null };
    }

    const payloadBytes = bytes.subarray(payloadStart, payloadEnd);
    const payloadStr = utf8Decode(payloadBytes);

    let parsed = null;
    try {
      parsed = JSON.parse(payloadStr);
    } catch {
      return { headers: {}, payloadJson: null, error: `Invalid JSON payload: ${payloadStr}` };
    }

    return { headers: {}, payloadJson: parsed, error: null };
  } catch (err) {
    return { headers: {}, payloadJson: null, error: err.message };
  }
}

/**
 * Generate AWS SigV4 signed WebSocket URL for Amazon Transcribe Streaming
 */
export function getSignedTranscribeUrl({
  accessKeyId,
  secretAccessKey,
  sessionToken,
  region = 'us-east-1',
  languageCode = 'en-US',
  sampleRate = 16000
}) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8); // YYYYMMDD

  const endpointHost = `transcribestreaming.${region}.amazonaws.com:8443`;
  const canonicalUri = '/stream-transcription-websocket';
  const service = 'transcribe';

  // Construct query parameters
  const params = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${dateStamp}/${region}/${service}/aws4_request`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': '300',
    'X-Amz-SignedHeaders': 'host',
    'language-code': languageCode,
    'media-encoding': 'pcm',
    'sample-rate': sampleRate.toString()
  };

  if (sessionToken) {
    params['X-Amz-Security-Token'] = sessionToken;
  }

  // Sort parameters alphabetically by key
  const sortedKeys = Object.keys(params).sort();
  const canonicalQueryString = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  const canonicalHeaders = `host:${endpointHost}\n`;
  const signedHeaders = 'host';
  const emptyPayloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    emptyPayloadHash
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    `${dateStamp}/${region}/${service}/aws4_request`,
    sha256HexSync(canonicalRequest)
  ].join('\n');

  // Derive signing key
  const kDate = hmacSha256Sync(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256Sync(kDate, region);
  const kService = hmacSha256Sync(kRegion, service);
  const kSigning = hmacSha256Sync(kService, 'aws4_request');

  const signature = toHex(hmacSha256Sync(kSigning, stringToSign));

  return `wss://${endpointHost}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

/**
 * Transcribe Streaming Manager
 */
export class TranscribeStreamingService {
  constructor({ onInterimResult, onFinalResult, onError, onStatusChange }) {
    this.onInterimResult = onInterimResult;
    this.onFinalResult = onFinalResult;
    this.onError = onError;
    this.onStatusChange = onStatusChange;

    this.socket = null;
    this.isConnected = false;
    this.isPaused = false;
    this.sessionId = null;
    this.processedResultIds = new Set();
  }

  /**
   * Connect to Amazon Transcribe WebSocket
   */
  connect({ accessKeyId, secretAccessKey, sessionToken, region, languageCode }) {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isPaused = false;
    this.sessionId = `session_${Date.now()}`;
    this.onStatusChange?.('connecting');

    try {
      const url = getSignedTranscribeUrl({
        accessKeyId,
        secretAccessKey,
        sessionToken,
        region,
        languageCode,
        sampleRate: 16000
      });

      this.socket = new WebSocket(url);
      this.socket.binaryType = 'arraybuffer';

      this.socket.onopen = () => {
        this.isConnected = true;
        this.onStatusChange?.('listening');
      };

      this.socket.onmessage = (event) => {
        if (!event.data || !(event.data instanceof ArrayBuffer)) return;

        const { payloadJson, error } = parseEventStreamMessage(event.data);
        if (error) {
          console.warn('Transcribe eventstream parse error:', error);
          return;
        }

        if (!payloadJson) return;

        // Check for Transcribe exception messages
        if (payloadJson.Message || payloadJson.__type) {
          const errMsg = payloadJson.Message || payloadJson.__type;
          this.onError?.(new Error(`Amazon Transcribe error: ${errMsg}`));
          return;
        }

        // Process Transcript results
        const results = payloadJson?.Transcript?.Results;
        if (!results || results.length === 0) return;

        for (const res of results) {
          const isPartial = res.IsPartial;
          const resultId = res.ResultId;
          const startTime = res.StartTime;
          const endTime = res.EndTime;
          const alt = res.Alternatives?.[0];
          const transcript = alt?.Transcript?.trim();

          if (!transcript) continue;

          if (isPartial) {
            this.onInterimResult?.({
              id: resultId,
              text: transcript,
              startTime,
              endTime
            });
          } else {
            // Final segment
            // Prevent duplicate emissions of finalized segment
            const dedupeKey = `${resultId}_${transcript}`;
            if (!this.processedResultIds.has(dedupeKey)) {
              this.processedResultIds.add(dedupeKey);
              this.onFinalResult?.({
                id: resultId,
                text: transcript,
                startTime,
                endTime,
                timestamp: Date.now()
              });
            }
          }
        }
      };

      this.socket.onerror = (evt) => {
        const error = new Error('Transcribe WebSocket encountered an error. Check AWS credentials, region, or network.');
        this.onError?.(error);
      };

      this.socket.onclose = (evt) => {
        this.isConnected = false;
        if (!this.isPaused) {
          this.onStatusChange?.(evt.wasClean ? 'idle' : 'disconnected');
        }
      };
    } catch (err) {
      this.isConnected = false;
      this.onStatusChange?.('error');
      this.onError?.(err);
    }
  }

  /**
   * Send audio chunk over WebSocket if open and not paused
   * @param {Uint8Array} pcmBytes
   */
  sendAudioChunk(pcmBytes) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || this.isPaused) {
      return;
    }

    try {
      const eventMessage = createAudioEventMessage(pcmBytes);
      this.socket.send(eventMessage);
    } catch (err) {
      console.warn('Error sending audio chunk to Transcribe:', err);
    }
  }

  /**
   * Pause transcription
   */
  pause() {
    this.isPaused = true;
    this.onStatusChange?.('paused');
  }

  /**
   * Resume transcription
   */
  resume(credentials) {
    this.isPaused = false;
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      if (credentials) {
        this.connect(credentials);
      }
    } else {
      this.onStatusChange?.('listening');
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    this.isConnected = false;
    this.isPaused = false;
    if (this.socket) {
      try {
        this.socket.onopen = null;
        this.socket.onmessage = null;
        this.socket.onerror = null;
        this.socket.onclose = null;
        this.socket.close();
      } catch {}
      this.socket = null;
    }
    this.onStatusChange?.('idle');
  }
}
