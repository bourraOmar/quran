/**
 * Quran Foundation Official API Client (Developer Portal OAuth2)
 */

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

const CLIENT_ID = process.env.QURAN_FOUNDATION_CLIENT_ID || 'cc8dc5d6-fe8a-4e3d-b26a-6454c24d5fd9';
const CLIENT_SECRET = process.env.QURAN_FOUNDATION_CLIENT_SECRET || 'qfcs_9b60b9cb55b94206b1db9ffe3cba688a43626ea06a834c38b03a3ffe63ac848d';

const OAUTH_URL = 'https://oauth2.quran.foundation/oauth2/token';
const API_BASE_URL = 'https://apis.quran.foundation/content/api/v4';
const FALLBACK_BASE_URL = 'https://api.quran.com/api/v4';

/**
 * Retrieves a valid Quran Foundation OAuth2 bearer token.
 * Automatically caches the token and refreshes when expired.
 */
export async function getQuranFoundationToken(): Promise<string | null> {
  const now = Date.now();
  // Return cached token if valid for at least another 60 seconds
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return null;
  }

  try {
    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const res = await fetch(OAUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=content',
    });

    if (!res.ok) {
      console.warn(`[QuranFoundation] Token request failed with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data.access_token) {
      cachedToken = {
        accessToken: data.access_token,
        expiresAt: now + (data.expires_in || 3600) * 1000,
      };
      return cachedToken.accessToken;
    }
  } catch (error) {
    console.error('[QuranFoundation] Error fetching OAuth2 token:', error);
  }

  return null;
}

/**
 * Authenticated fetch for Quran Foundation Content APIs.
 * Automatically adds x-auth-token and x-client-id headers.
 * Falls back to public api.quran.com if needed.
 */
export async function qfFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  // Normalize endpoint path (remove leading slash if present)
  const cleanPath = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  const token = await getQuranFoundationToken();

  if (token && CLIENT_ID) {
    try {
      const url = `${API_BASE_URL}/${cleanPath}`;
      const headers = new Headers(init?.headers);
      headers.set('x-auth-token', token);
      headers.set('x-client-id', CLIENT_ID);

      const res = await fetch(url, {
        ...init,
        headers,
      });

      if (res.ok) {
        return res;
      }
      console.warn(`[QuranFoundation] Request to ${url} returned ${res.status}, trying fallback...`);
    } catch (err) {
      console.warn('[QuranFoundation] Primary request error, falling back:', err);
    }
  }

  // Fallback to public endpoint
  const fallbackUrl = `${FALLBACK_BASE_URL}/${cleanPath}`;
  return fetch(fallbackUrl, init);
}
