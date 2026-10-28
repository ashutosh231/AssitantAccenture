/**
 * Amazon Bedrock Service
 * Invokes Bedrock Runtime with configured model (BEDROCK_MODEL_ID=openai.gpt-6.1-terra)
 * using the Bedrock Converse API with SigV4 signing.
 */

import {
  sha256HexSync,
  hmacSha256Sync,
  toHex,
  utf8Encode
} from '../utils/crypto.js';

export const ASSESSMENT_TYPES = [
  {
    id: 'Scenario-Based Reply',
    title: 'Scenario-Based Reply',
    tag: 'Workplace Communication',
    shortDesc: 'Concise, polite, professional response emphasizing collaboration & practical action.',
    icon: 'MessageSquareText'
  },
  {
    id: 'Situation-Based Answer',
    title: 'Situation-Based Answer',
    tag: 'Structured Problem Solving',
    shortDesc: 'Relevant, logical response with clear structure without forcing STAR.',
    icon: 'Brain'
  },
  {
    id: 'Read Aloud',
    title: 'Read Aloud',
    tag: 'Pronunciation & Punctuation',
    shortDesc: 'Faithful display of captured passage with clean punctuation.',
    icon: 'BookOpen'
  },
  {
    id: 'Repeat What You Hear',
    title: 'Repeat What You Hear',
    tag: 'Verbatim Recall',
    shortDesc: 'Captured sentence returned faithfully without paraphrasing.',
    icon: 'Volume2'
  },
  {
    id: 'Correct the Wrong Sentence',
    title: 'Correct the Wrong Sentence',
    tag: 'Grammar & Accuracy',
    shortDesc: 'Corrected sentence with concise grammatical explanation.',
    icon: 'CheckCircle2'
  },
  {
    id: 'Fill in the Blanks',
    title: 'Fill in the Blanks',
    tag: 'Grammar & Vocabulary',
    shortDesc: 'Appropriate word/phrase, completed sentence, and grammar rule.',
    icon: 'Sparkles'
  },
  {
    id: '45-Second Speech',
    title: '45-Second Speech',
    tag: '90-120 Words Delivery',
    shortDesc: 'Natural spoken response (~90-120 words) with intro, 2-3 points, and conclusion.',
    icon: 'Mic'
  },
  {
    id: 'Professional Email',
    title: 'Professional Email',
    tag: 'Business Correspondence',
    shortDesc: 'Subject, greeting, concise body, and professional closing.',
    icon: 'Mail'
  }
];

/**
 * Build system prompt for the given assessment type
 */
export function buildSystemPrompt(assessmentType) {
  const baseRules = `You are an elite Accenture Communication Assessment preparation assistant.
Your job is to provide high-scoring, fluent, professional, and natural responses based on the spoken question captured from the assessment laptop.
CRITICAL CONSTRAINT: For ambiguous or incomplete transcripts, do not invent missing question details. Clearly explain the ambiguity or ask for clarification.
Never include meta-commentary like "Here is your answer:" or "Hope this helps!". Output only the response content ready to be read aloud or reviewed.`;

  switch (assessmentType) {
    case 'Scenario-Based Reply':
      return `${baseRules}
Assessment Type: Scenario-Based Reply.
Instructions:
- Generate a concise, polite, professional verbal response to the workplace scenario.
- Emphasize clear communication, active collaboration, accountability, and practical problem-solving action.
- Keep the tone confident, respectful, and constructive.
- Format the response as natural spoken dialogue that the candidate can speak smoothly.`;

    case 'Situation-Based Answer':
      return `${baseRules}
Assessment Type: Situation-Based Answer.
Instructions:
- Provide a relevant, logical response with a clear, engaging structure.
- Do NOT force the STAR (Situation, Task, Action, Result) format when it does not naturally fit the question.
- Focus on clarity, direct addressing of the core question, and authentic professional reasoning.`;

    case 'Read Aloud':
      return `${baseRules}
Assessment Type: Read Aloud.
Instructions:
- Display the captured passage faithfully with appropriate punctuation, capitalizations, and phrasing pauses.
- Do NOT paraphrase, summarize, or generate an unrelated answer.
- Present the text cleanly so the candidate can read it aloud with natural rhythm and inflection.`;

    case 'Repeat What You Hear':
      return `${baseRules}
Assessment Type: Repeat What You Hear.
Instructions:
- Return the captured sentence as faithfully and accurately as possible.
- Do NOT paraphrase, alter words, or add commentary.
- Ensure correct capitalization and punctuation.`;

    case 'Correct the Wrong Sentence':
      return `${baseRules}
Assessment Type: Correct the Wrong Sentence.
Instructions:
- Format your output into two clear sections:
  1. Corrected Sentence: (The grammatically correct version)
  2. Explanation: (A concise 1-2 sentence explanation of the specific grammatical error and correction rule).`;

    case 'Fill in the Blanks':
      return `${baseRules}
Assessment Type: Fill in the Blanks.
Instructions:
- Format your output into three concise sections:
  1. Missing Word/Phrase: [the exact word or phrase]
  2. Complete Sentence: [the full sentence with the blank filled]
  3. Explanation: [brief explanation of why this word/tense/form is grammatically required].`;

    case '45-Second Speech':
      return `${baseRules}
Assessment Type: 45-Second Speech.
Instructions:
- Generate a natural spoken response of approximately 90–120 words (the optimal word count for a 45-second spoken answer at 130-150 words per minute).
- Structure:
  1. Short, compelling opening statement (1 sentence)
  2. Two or three crisp, well-connected points with practical examples (3-4 sentences)
  3. Memorable concluding takeaway (1 sentence)
- Use natural conversational transition words (e.g. "Firstly", "In addition", "Ultimately").`;

    case 'Professional Email':
      return `${baseRules}
Assessment Type: Professional Email.
Instructions:
- Generate a professional email tailored to the situation, recipient, and requested tone.
- Include:
  - Subject: [Clear, informative subject line]
  - Greeting: [Appropriate professional salutation]
  - Body: [2-3 concise paragraphs covering context, action items, and next steps]
  - Closing: [Professional sign-off and name placeholder].`;

    default:
      return `${baseRules}
Provide a high-scoring, clear, professional communication assessment response for the question.`;
  }
}

/**
 * Sign an HTTP request using AWS SigV4
 */
function signAwsRequest({
  method,
  url,
  body,
  service,
  region,
  accessKeyId,
  secretAccessKey,
  sessionToken
}) {
  const parsedUrl = new URL(url);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const bodyBytes = utf8Encode(body);
  const payloadHash = sha256HexSync(bodyBytes);

  const headers = {
    'content-type': 'application/json',
    host: parsedUrl.host,
    'x-amz-date': amzDate
  };

  if (sessionToken) {
    headers['x-amz-security-token'] = sessionToken;
  }

  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  // AWS SigV4 Canonical URI: each path segment must be URI encoded (double-encoded for percent-encoded characters)
  const canonicalUri = parsedUrl.pathname
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  const canonicalRequest = [
    method,
    canonicalUri,
    parsedUrl.search ? parsedUrl.search.slice(1) : '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    `${dateStamp}/${region}/${service}/aws4_request`,
    sha256HexSync(canonicalRequest)
  ].join('\n');

  const kDate = hmacSha256Sync(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256Sync(kDate, region);
  const kService = hmacSha256Sync(kRegion, service);
  const kSigning = hmacSha256Sync(kService, 'aws4_request');

  const signature = toHex(hmacSha256Sync(kSigning, stringToSign));

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${dateStamp}/${region}/${service}/aws4_request, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    ...headers,
    Authorization: authHeader
  };
}

/**
 * Invoke Amazon Bedrock for the configured model
 * @param {Object} params
 * @param {string} params.transcriptText - Immutable snapshot of captured transcript
 * @param {string} params.assessmentType - One of the 8 assessment types
 * @param {Object} params.credentials - AWS credentials
 * @returns {Promise<string>} Generated answer text
 */
export async function generateBedrockAnswer({ transcriptText, assessmentType, credentials }) {
  if (!transcriptText || !transcriptText.trim()) {
    throw new Error('Transcript is empty. Capture laptop audio before submitting to AI.');
  }

  if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error('AWS credentials are not configured. Configure Cognito Pool ID or test credentials in Settings.');
  }

  const region = credentials.region || 'us-east-1';
  let modelId = credentials.bedrockModelId || 'openai.gpt-6.1-terra';

  // Support inference profile prefix if standard modelId is passed
  // Bedrock cross-region inference profiles use 'us.' or 'global.' prefix
  const systemPrompt = buildSystemPrompt(assessmentType);

  // Converse API payload
  const requestBody = JSON.stringify({
    system: [
      {
        text: systemPrompt
      }
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            text: `Here is the transcribed audio question/instruction from the Accenture assessment laptop:\n\n"${transcriptText.trim()}"\n\nPlease provide the optimal response for: ${assessmentType}.`
          }
        ]
      }
    ],
    inferenceConfig: {
      maxTokens: 1024,
      temperature: 0.3
    }
  });

  // Try inference profile ID if model requires inference profile (e.g. us.amazon.nova-2-lite-v1:0 or us.openai.gpt-6.1-terra)
  const candidateModelIds = [];
  if (modelId.startsWith('us.') || modelId.startsWith('global.') || modelId.startsWith('eu.')) {
    candidateModelIds.push(modelId);
  } else {
    // Bedrock foundation models and Nova models require regional inference profiles
    candidateModelIds.push(`us.${modelId}`);
    candidateModelIds.push(modelId);
    candidateModelIds.push(`global.${modelId}`);
  }

  let lastError = null;

  for (const candidateId of candidateModelIds) {
    try {
      const result = await invokeConverse({
        modelId: candidateId,
        region,
        body: requestBody,
        credentials
      });
      return result;
    } catch (err) {
      lastError = err;
      // If error is about invalid model id or on-demand throughput requiring inference profile, try next candidate
      if (
        err.message?.includes('ValidationException') ||
        err.message?.includes('inference profile') ||
        err.message?.includes('on-demand throughput')
      ) {
        continue;
      }
      // For permission/access errors, do not retry other prefixes
      break;
    }
  }

  throw lastError;
}

/**
 * Internal helper to call Bedrock Converse API with direct fetch and Vite dev proxy fallback
 */
async function invokeConverse({ modelId, region, body, credentials }) {
  const directEndpoint = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(modelId)}/converse`;
  const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Generate signed headers for direct endpoint
  const signedHeaders = signAwsRequest({
    method: 'POST',
    url: directEndpoint,
    body,
    service: 'bedrock',
    region,
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken
  });

  let response;

  try {
    // Attempt direct fetch first
    response = await fetch(directEndpoint, {
      method: 'POST',
      headers: signedHeaders,
      body
    });
  } catch (directFetchErr) {
    // If CORS or network error blocks browser fetch directly to AWS in dev, try dev proxy
    if (isLocalDev) {
      try {
        const proxyEndpoint = `/api/bedrock/model/${encodeURIComponent(modelId)}/converse`;
        response = await fetch(proxyEndpoint, {
          method: 'POST',
          headers: signedHeaders,
          body
        });
      } catch (proxyErr) {
        throw new Error(
          `Bedrock network error: Unable to connect to Bedrock Runtime in region ${region}. Check internet connection or CORS settings. (${directFetchErr.message})`
        );
      }
    } else {
      throw new Error(
        `Bedrock CORS / Network Error: Direct browser fetch to AWS Bedrock was blocked. In production, configure an API gateway or Cognito allowed origin. (${directFetchErr.message})`
      );
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson = null;
    try {
      errorJson = JSON.parse(errorText);
    } catch {}

    const errorMessage = errorJson?.message || errorJson?.Message || errorText;

    if (response.status === 403 || errorMessage.includes('AccessDeniedException')) {
      if (errorMessage.includes('not available for this account')) {
        throw new Error(
          `Model Access Required: Bedrock model "${modelId}" is not yet enabled for your AWS account (${credentials.region}). Please request model access in the AWS Bedrock Console (Bedrock > Model access > Request access).`
        );
      }
      throw new Error(`AWS Bedrock Permission Denied (403): ${errorMessage}`);
    }

    if (response.status === 429 || errorMessage.includes('ThrottlingException')) {
      throw new Error('Amazon Bedrock is currently throttled. Please wait a few seconds and tap Regenerate.');
    }

    throw new Error(`Amazon Bedrock error (${response.status}): ${errorMessage}`);
  }

  const data = await response.json();

  // Extract text from Bedrock Converse API response:
  // output.message.content[0].text
  const answerText = data?.output?.message?.content?.[0]?.text;
  if (!answerText || !answerText.trim()) {
    throw new Error('Amazon Bedrock returned an empty response. Tap Regenerate to try again.');
  }

  return answerText.trim();
}
