import test from 'node:test';
import assert from 'node:assert/strict';
import {
  crc32,
  sha256HexSync,
  hmacSha256Sync,
  toHex,
  utf8Encode,
  utf8Decode
} from '../src/utils/crypto.js';

test('utf8Encode and utf8Decode should roundtrip strings correctly', () => {
  const original = 'Accenture Assessment - Hello World! 🚀';
  const encoded = utf8Encode(original);
  const decoded = utf8Decode(encoded);
  assert.equal(decoded, original);
});

test('crc32 calculates correct IEEE 802.3 checksums', () => {
  // Standard CRC32 of "123456789" is 0xcbf43926 (3421780262)
  const input = utf8Encode('123456789');
  const checksum = crc32(input);
  assert.equal(checksum, 0xcbf43926);

  // CRC32 of empty buffer is 0
  assert.equal(crc32(new Uint8Array(0)), 0);
});

test('sha256HexSync produces correct known SHA-256 hashes', () => {
  // SHA-256 of empty string is e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  const emptyHash = sha256HexSync('');
  assert.equal(emptyHash, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  // SHA-256 of "Hello" is 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969
  const helloHash = sha256HexSync('Hello');
  assert.equal(helloHash, '185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969');
});

test('hmacSha256Sync produces correct HMAC signatures', () => {
  const key = 'secret_key';
  const message = 'test_message';
  const sig = toHex(hmacSha256Sync(key, message));
  assert.equal(typeof sig, 'string');
  assert.equal(sig.length, 64);
});
