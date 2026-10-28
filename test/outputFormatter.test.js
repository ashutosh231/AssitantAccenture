import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanMarkdown,
  parseFillInTheBlanks,
  parseCorrectTheSentence,
  getCleanSpokenText
} from '../src/utils/outputFormatter.js';

test('parseFillInTheBlanks handles user screenshot format with ### and brackets', () => {
  const rawText = `### Missing Word/Phrase: [is]

### Complete Sentence: [Hello, my name is Don Lee.]

### Explanation: [The verb “is” is required to link the subject “my name” with the complement “Don Lee,” forming a complete and grammatically correct sentence. In English, the structure “my name is [name]” is the standard way to introduce oneself.]`;

  const parsed = parseFillInTheBlanks(rawText);

  assert.equal(parsed.missingWord, 'is');
  assert.equal(parsed.completeSentence, 'Hello, my name is Don Lee.');
  assert.ok(parsed.explanation.startsWith('The verb “is” is required'));
  assert.ok(parsed.explanation.endsWith('standard way to introduce oneself.'));
  assert.ok(!parsed.explanation.includes('###'));
  assert.ok(!parsed.explanation.startsWith('['));
});

test('parseFillInTheBlanks handles bold asterisks and unbracketed format', () => {
  const rawText = `**Missing Word/Phrase:** was
**Complete Sentence:** She was late for the client presentation.
**Explanation:** The simple past tense "was" matches the completed action.`;

  const parsed = parseFillInTheBlanks(rawText);

  assert.equal(parsed.missingWord, 'was');
  assert.equal(parsed.completeSentence, 'She was late for the client presentation.');
  assert.equal(parsed.explanation, 'The simple past tense "was" matches the completed action.');
});

test('parseCorrectTheSentence handles markdown headers and brackets', () => {
  const rawText = `### Corrected Sentence: [They do not have enough resources to finish on time.]
### Explanation: [Subject-verb agreement requires "do not" with third-person plural "They".]`;

  const parsed = parseCorrectTheSentence(rawText);

  assert.equal(parsed.corrected, 'They do not have enough resources to finish on time.');
  assert.equal(parsed.explanation, 'Subject-verb agreement requires "do not" with third-person plural "They".');
});

test('cleanMarkdown removes headings, bold markers, and surrounding brackets', () => {
  assert.equal(cleanMarkdown('### Heading Test'), 'Heading Test');
  assert.equal(cleanMarkdown('**Important Notice**'), 'Important Notice');
  assert.equal(cleanMarkdown('[Bracketed Text]'), 'Bracketed Text');
});

test('getCleanSpokenText extracts ready-to-speak text without markdown', () => {
  const rawFill = `### Missing Word/Phrase: [is]
### Complete Sentence: [Hello, my name is Don Lee.]
### Explanation: [Explanation here]`;

  assert.equal(getCleanSpokenText(rawFill, 'Fill in the Blanks'), 'Hello, my name is Don Lee.');

  const rawCorrect = `Corrected Sentence: She doesn't like delays.
Explanation: Grammar rule here.`;
  assert.equal(getCleanSpokenText(rawCorrect, 'Correct the Wrong Sentence'), "She doesn't like delays.");
});
