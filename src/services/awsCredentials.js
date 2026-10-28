/**
 * AWS Credentials Management Service
 * Supports:
 * 1. Amazon Cognito Identity Pool (Unauthenticated identity for client-side browser usage)
 * 2. In-memory / browser session credentials configured in Settings panel
 * 3. Vite development environment variables (VITE_AWS_*, AWS_*)
 */

const STORAGE_KEY = 'acc_help_aws_credentials';

let cachedCognitoCreds = null;

/**
 * Fetch temporary credentials from an Amazon Cognito Identity Pool
 * @param {string} identityPoolId - e.g. "us-east-1:12345678-abcd-1234-efgh-1234567890ab"
 * @param {string} region - e.g. "us-east-1"
 * @returns {Promise<{ accessKeyId: string, secretAccessKey: string, sessionToken: string, expiration: number }>}
 */
export async function fetchCognitoCredentials(identityPoolId, region) {
  if (!identityPoolId) {
    throw new Error('Cognito Identity Pool ID is not provided');
  }

  // Check cache (refresh if within 5 minutes of expiration)
  const now = Date.now() / 1000;
  if (cachedCognitoCreds && cachedCognitoCreds.expiration > now + 300) {
    return cachedCognitoCreds;
  }

  const endpoint = `https://cognito-identity.${region}.amazonaws.com/`;

  // Step 1: Get Identity ID
  const getIdResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityService.GetId'
    },
    body: JSON.stringify({
      IdentityPoolId: identityPoolId
    })
  });

  if (!getIdResponse.ok) {
    const errorText = await getIdResponse.text();
    throw new Error(`Cognito GetId failed (${getIdResponse.status}): ${errorText}`);
  }

  const { IdentityId } = await getIdResponse.json();
  if (!IdentityId) {
    throw new Error('Cognito did not return an IdentityId');
  }

  // Step 2: Get Credentials for Identity
  const getCredsResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityService.GetCredentialsForIdentity'
    },
    body: JSON.stringify({
      IdentityId
    })
  });

  if (!getCredsResponse.ok) {
    const errorText = await getCredsResponse.text();
    throw new Error(`Cognito GetCredentialsForIdentity failed (${getCredsResponse.status}): ${errorText}`);
  }

  const credsData = await getCredsResponse.json();
  const c = credsData.Credentials;
  if (!c || !c.AccessKeyId || !c.SecretKey) {
    throw new Error('Cognito returned invalid credentials');
  }

  cachedCognitoCreds = {
    accessKeyId: c.AccessKeyId,
    secretAccessKey: c.SecretKey,
    sessionToken: c.SessionToken,
    expiration: c.Expiration ? (typeof c.Expiration === 'number' ? c.Expiration : Math.floor(new Date(c.Expiration).getTime() / 1000)) : now + 3600
  };

  return cachedCognitoCreds;
}

/**
 * Get active AWS configuration and credentials
 * Resolution order:
 * 1. User manual credentials saved in browser session/local storage
 * 2. Amazon Cognito Identity Pool
 * 3. Vite environment variables (for local dev testing)
 */
export async function getAwsCredentials() {
  const env = import.meta.env || {};
  const region =
    sessionStorage.getItem('acc_region') ||
    localStorage.getItem('acc_region') ||
    env.AWS_REGION ||
    env.VITE_AWS_REGION ||
    'us-east-1';

  const languageCode =
    sessionStorage.getItem('acc_lang') ||
    localStorage.getItem('acc_lang') ||
    env.AWS_TRANSCRIBE_LANGUAGE_CODE ||
    env.VITE_AWS_TRANSCRIBE_LANGUAGE_CODE ||
    'en-US';

  const bedrockModelId =
    sessionStorage.getItem('acc_model_id') ||
    localStorage.getItem('acc_model_id') ||
    env.BEDROCK_MODEL_ID ||
    env.VITE_BEDROCK_MODEL_ID ||
    'openai.gpt-6.1-terra';

  // 1. Check user-configured keys in localStorage/sessionStorage
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accessKeyId && parsed.secretAccessKey) {
        return {
          accessKeyId: parsed.accessKeyId.trim(),
          secretAccessKey: parsed.secretAccessKey.trim(),
          sessionToken: parsed.sessionToken?.trim() || null,
          region,
          languageCode,
          bedrockModelId,
          source: 'user_storage'
        };
      }
    }
  } catch {
    // Ignore storage parse error
  }

  // 2. Check Cognito Identity Pool
  const cognitoPoolId =
    sessionStorage.getItem('acc_cognito_pool_id') ||
    localStorage.getItem('acc_cognito_pool_id') ||
    env.AWS_COGNITO_IDENTITY_POOL_ID ||
    env.VITE_AWS_COGNITO_IDENTITY_POOL_ID;

  if (cognitoPoolId && cognitoPoolId !== 'your-identity-pool-id') {
    try {
      const creds = await fetchCognitoCredentials(cognitoPoolId, region);
      return {
        ...creds,
        region,
        languageCode,
        bedrockModelId,
        cognitoPoolId,
        source: 'cognito'
      };
    } catch (err) {
      console.warn('Failed to load Cognito credentials, falling back:', err.message);
    }
  }

  // 3. Check dev environment variables (if provided in local testing)
  const envKey = env.AWS_ACCESS_KEY_ID || env.VITE_AWS_ACCESS_KEY_ID;
  const envSecret = env.AWS_SECRET_ACCESS_KEY || env.VITE_AWS_SECRET_ACCESS_KEY;
  if (envKey && envSecret) {
    return {
      accessKeyId: envKey.trim(),
      secretAccessKey: envSecret.trim(),
      sessionToken: env.AWS_SESSION_TOKEN || env.VITE_AWS_SESSION_TOKEN || null,
      region,
      languageCode,
      bedrockModelId,
      source: 'env'
    };
  }

  return {
    accessKeyId: null,
    secretAccessKey: null,
    sessionToken: null,
    region,
    languageCode,
    bedrockModelId,
    source: 'none'
  };
}

/**
 * Save custom credentials to browser storage (personal use / testing)
 */
export function saveCustomCredentials({ accessKeyId, secretAccessKey, sessionToken, region, languageCode, bedrockModelId, cognitoPoolId, remember = false }) {
  const store = remember ? localStorage : sessionStorage;
  const otherStore = remember ? sessionStorage : localStorage;

  if (accessKeyId && secretAccessKey) {
    store.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim(),
        sessionToken: sessionToken ? sessionToken.trim() : null
      })
    );
    otherStore.removeItem(STORAGE_KEY);
  } else {
    store.removeItem(STORAGE_KEY);
    otherStore.removeItem(STORAGE_KEY);
  }

  if (region) store.setItem('acc_region', region.trim());
  if (languageCode) store.setItem('acc_lang', languageCode.trim());
  if (bedrockModelId) store.setItem('acc_model_id', bedrockModelId.trim());
  if (cognitoPoolId) store.setItem('acc_cognito_pool_id', cognitoPoolId.trim());
}

/**
 * Clear custom credentials
 */
export function clearCustomCredentials() {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem('acc_cognito_pool_id');
  localStorage.removeItem('acc_cognito_pool_id');
  cachedCognitoCreds = null;
}
