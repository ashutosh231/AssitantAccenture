/**
 * Output Formatter and Parsers for Accenture Assessment Outputs
 */

/**
 * Remove bracket wrappers e.g. "[is]" -> "is" and clean surrounding quotes/asterisks
 * @param {string} val
 * @returns {string}
 */
export function stripBrackets(val) {
  if (!val) return '';
  let cleaned = val.trim();
  // Strip outer markdown asterisks
  cleaned = cleaned.replace(/^\*\*+|\*\*+$/g, '').trim();
  // Strip outer brackets or trailing brackets
  cleaned = cleaned.replace(/^\[+/, '').replace(/\]+$/, '').trim();
  // Strip outer quotes (both standard and curly)
  cleaned = cleaned.replace(/^["'“”‘’]|["'“”‘’]$/g, '').trim();
  return cleaned;
}

/**
 * Clean markdown artifacts (### headers, ** asterisks, [brackets], extra quotes)
 * @param {string} text
 * @returns {string}
 */
export function cleanMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s*/gm, '') // Remove markdown heading hashes
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold**
    .replace(/__([^_]+)__/g, '$1') // Remove __underline/bold__
    .replace(/^\[\s*([\s\S]*?)\s*\]$/g, '$1') // Remove surrounding brackets
    .trim();
}

/**
 * Parse Fill in the Blanks output from Amazon Bedrock
 * @param {string} rawText
 * @returns {{ missingWord: string, completeSentence: string, explanation: string, raw: string }}
 */
export function parseFillInTheBlanks(rawText) {
  if (!rawText) {
    return {
      missingWord: '',
      completeSentence: '',
      explanation: '',
      raw: ''
    };
  }

  let missingWord = '';
  let completeSentence = '';
  let explanation = '';

  // 1. Missing Word / Phrase pattern: handles "### Missing Word/Phrase: [is]", "**Missing Word/Phrase:** was", etc.
  const missingMatch = rawText.match(
    /(?:^|\n)[#*\s\d.-]*Missing\s*(?:Word(?:\s*\/\s*Phrase)?|Phrase)\s*[:\-*]*\s*\[?([^\]\r\n]+)\]?/i
  );
  if (missingMatch) {
    missingWord = stripBrackets(missingMatch[1]);
  }

  // 2. Complete Sentence pattern: captures text after "Complete Sentence:" up until "Explanation:"
  const sentenceMatch = rawText.match(
    /(?:^|\n)[#*\s\d.-]*Complete\s*Sentence\s*[:\-*]*\s*\[?([\s\S]*?)(?:\]?\s*(?:\n|\r\n)?(?=(?:^|\n)[#*\s\d.-]*Explanation|\s*$))/i
  );
  if (sentenceMatch) {
    completeSentence = stripBrackets(cleanMarkdown(sentenceMatch[1]));
  }

  // 3. Explanation pattern: captures text after "Explanation:"
  const explanationMatch = rawText.match(
    /(?:^|\n)[#*\s\d.-]*Explanation\s*[:\-*]*\s*\[?([\s\S]*)/i
  );
  if (explanationMatch) {
    explanation = stripBrackets(cleanMarkdown(explanationMatch[1]));
  }

  // Fallback heuristic: If regex didn't extract missingWord but text has bracketed word
  if (!missingWord) {
    const bracketMatch = rawText.match(/\[([a-zA-Z0-9\s'-]+)\]/);
    if (bracketMatch) {
      missingWord = bracketMatch[1].trim();
    }
  }

  if (!completeSentence) {
    // If no complete sentence extracted, fallback to clean rawText
    completeSentence = cleanMarkdown(rawText);
  }

  return {
    missingWord,
    completeSentence,
    explanation,
    raw: rawText
  };
}

/**
 * Parse Correct the Wrong Sentence output from Amazon Bedrock
 * @param {string} rawText
 * @returns {{ corrected: string, explanation: string, raw: string }}
 */
export function parseCorrectTheSentence(rawText) {
  if (!rawText) {
    return {
      corrected: '',
      explanation: '',
      raw: ''
    };
  }

  let corrected = '';
  let explanation = '';

  // 1. Corrected Sentence pattern
  const correctedMatch = rawText.match(
    /(?:^|\n)[#*\s\d.-]*Corrected\s*Sentence\s*[:\-*]*\s*\[?([\s\S]*?)(?:\]?\s*(?:\n|\r\n)?(?=(?:^|\n)[#*\s\d.-]*Explanation|\s*$))/i
  );
  if (correctedMatch) {
    corrected = stripBrackets(cleanMarkdown(correctedMatch[1]));
  }

  // 2. Explanation pattern
  const explanationMatch = rawText.match(
    /(?:^|\n)[#*\s\d.-]*Explanation\s*[:\-*]*\s*\[?([\s\S]*)/i
  );
  if (explanationMatch) {
    explanation = stripBrackets(cleanMarkdown(explanationMatch[1]));
  }

  // Fallback splitting if regex didn't capture
  if (!corrected) {
    const parts = rawText.split(/(?:Corrected Sentence:|Explanation:)/i).filter(Boolean);
    corrected = stripBrackets(cleanMarkdown(parts[0] || rawText));
    if (!explanation && parts[1]) {
      explanation = stripBrackets(cleanMarkdown(parts[1]));
    }
  }

  return {
    corrected: corrected || cleanMarkdown(rawText),
    explanation,
    raw: rawText
  };
}

/**
 * Get clean spoken text to copy to clipboard or display cleanly
 * @param {string} rawText
 * @param {string} assessmentType
 * @returns {string}
 */
export function getCleanSpokenText(rawText, assessmentType) {
  if (!rawText) return '';

  if (assessmentType === 'Fill in the Blanks') {
    const parsed = parseFillInTheBlanks(rawText);
    return parsed.completeSentence || parsed.missingWord || cleanMarkdown(rawText);
  }

  if (assessmentType === 'Correct the Wrong Sentence') {
    const parsed = parseCorrectTheSentence(rawText);
    return parsed.corrected || cleanMarkdown(rawText);
  }

  if (assessmentType === 'Repeat What You Hear' || assessmentType === 'Read Aloud') {
    return stripBrackets(cleanMarkdown(rawText));
  }

  return cleanMarkdown(rawText);
}
