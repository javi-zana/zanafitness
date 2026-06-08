// Password gate for the ai.zanafitness.com internal tool.
//
// This is intentionally separate from Supabase member/coach auth. The whole
// subdomain sits behind a single shared password (AI_TOOL_PASSWORD). On success
// we issue a signed, httpOnly cookie; middleware verifies it on every request.
//
// All crypto uses the Web Crypto API so this works in BOTH the edge runtime
// (middleware) and the node runtime (route handlers).

export const AI_SESSION_COOKIE = 'zana_ai_session'
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

/** The shared secret. Doubles as the signing key, so one env var configures everything. */
export function getAiSecret(): string {
  return process.env.AI_TOOL_PASSWORD ?? ''
}

const encoder = new TextEncoder()

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Length-independent constant-time string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Mint a session token: `<expiry-ms>.<hmac>`. */
export async function createSessionToken(secret: string, ttlMs = SESSION_TTL_MS): Promise<string> {
  const exp = String(Date.now() + ttlMs)
  const sig = await hmacHex(secret, exp)
  return `${exp}.${sig}`
}

/** Verify a session token against the secret and check it hasn't expired. */
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token || !secret) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig) return false
  const expMs = Number(exp)
  if (!Number.isFinite(expMs) || expMs < Date.now()) return false
  const expected = await hmacHex(secret, exp)
  return safeEqual(sig, expected)
}

/** Compare a submitted password against the configured secret in constant time. */
export function checkPassword(submitted: string, secret: string): boolean {
  if (!secret) return false
  return safeEqual(submitted, secret)
}
