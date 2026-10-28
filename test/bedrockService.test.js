import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ASSESSMENT_TYPES,
  buildSystemPrompt
} from '../src/services/bedrockService.js';

test('ASSESSMENT_TYPES includes all 8 specified assessment categories', () => {
  const expectedTypes = [
    'Scenario-Based Reply',
    'Situation-Based Answer',
    'Read Aloud',
    'Repeat What You Hear',
    'Correct the Wrong Sentence',
    'Fill in the Blanks',
    '45-Second Speech',
    'Professional Email'
  ];

  assert.equal(ASSESSMENT_TYPES.length, 8);
  const actualIds = ASSESSMENT_TYPES.map((t) => t.id);
  assert.deepEqual(actualIds, expectedTypes);
});

test('buildSystemPrompt enforces ambiguity constraint across all types', () => {
  for (const type of ASSESSMENT_TYPES) {
    const prompt = buildSystemPrompt(type.id);
    assert.ok(
      prompt.includes('For ambiguous or incomplete transcripts, do not invent missing question details'),
      `Prompt for ${type.id} must enforce the ambiguity rule`
    );
  }
});

test('buildSystemPrompt builds specific instructions for each assessment category', () => {
  // Scenario-Based Reply: collaboration & practical action
  const scenarioPrompt = buildSystemPrompt('Scenario-Based Reply');
  assert.ok(scenarioPrompt.includes('collaboration'));
  assert.ok(scenarioPrompt.includes('practical'));

  // Situation-Based Answer: do not force STAR
  const sitPrompt = buildSystemPrompt('Situation-Based Answer');
  assert.ok(sitPrompt.includes('Do NOT force the STAR'));

  // Read Aloud: faithful without paraphrasing
  const readPrompt = buildSystemPrompt('Read Aloud');
  assert.ok(readPrompt.includes('faithfully with appropriate punctuation'));
  assert.ok(readPrompt.includes('Do NOT paraphrase'));

  // Repeat What You Hear: verbatim recall
  const repeatPrompt = buildSystemPrompt('Repeat What You Hear');
  assert.ok(repeatPrompt.includes('faithfully and accurately as possible'));

  // Correct the Wrong Sentence: corrected sentence and explanation
  const correctPrompt = buildSystemPrompt('Correct the Wrong Sentence');
  assert.ok(correctPrompt.includes('Corrected Sentence:'));
  assert.ok(correctPrompt.includes('Explanation:'));

  // Fill in the Blanks: missing word, complete sentence, explanation
  const fillPrompt = buildSystemPrompt('Fill in the Blanks');
  assert.ok(fillPrompt.includes('Missing Word/Phrase:'));
  assert.ok(fillPrompt.includes('Complete Sentence:'));

  // 45-Second Speech: 90-120 words
  const speechPrompt = buildSystemPrompt('45-Second Speech');
  assert.ok(speechPrompt.includes('90–120 words'));

  // Professional Email: Subject, Greeting, Body, Closing
  const emailPrompt = buildSystemPrompt('Professional Email');
  assert.ok(emailPrompt.includes('Subject:'));
  assert.ok(emailPrompt.includes('Greeting:'));
  assert.ok(emailPrompt.includes('Body:'));
  assert.ok(emailPrompt.includes('Closing:'));
});
