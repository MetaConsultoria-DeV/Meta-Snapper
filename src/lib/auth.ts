import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Núcleo de sessão do login.
 *
 * Mantido livre de `node:crypto` de propósito: este módulo é importado pelo
 * `proxy.ts` (o gate de acesso). Assim o grafo do proxy depende apenas de `jose`,
 * que é seguro tanto no runtime Node quanto no Edge.
 */

/** Key of the session cookie used throughout the application. */
export const SESSION_COOKIE = 'bdu_session';

/** Default duration for sessions if not customized in env variables. */
const DEFAULT_SESSION_HOURS = 12;

/**
 * Derives the cryptographic signature key from the AUTH_SECRET environment variable.
 * Returns null if the secret is missing or too short, leading to fail-closed state.
 *
 * @returns {Uint8Array | null} The encoded secret key, or null if invalid/missing.
 */
function getSecretKey(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) return null;
  return new TextEncoder().encode(secret);
}

/**
 * Calculates the maximum age of a session in seconds based on the AUTH_SESSION_HOURS env variable.
 * Fallbacks to the default of 12 hours if undefined or invalid.
 *
 * @returns {number} Max session age in seconds.
 */
export function sessionMaxAgeSeconds(): number {
  const raw = Number(process.env.AUTH_SESSION_HOURS);
  const hours = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_SESSION_HOURS;
  return Math.floor(hours * 3600);
}

/**
 * Issues and signs a JWT token using HS256 algorithm.
 * Sets the subject (username) and expiration duration.
 *
 * @param {string} subject - The identifier/subject of the session (typically username).
 * @returns {Promise<string | null>} The signed JWT token, or null if the signature key is missing.
 */
export async function createSession(subject: string): Promise<string | null> {
  const key = getSecretKey();
  if (!key) return null;

  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(subject)
    .setIssuedAt(now)
    .setExpirationTime(now + sessionMaxAgeSeconds())
    .sign(key);
}

/**
 * Verifies the validity of the provided session JWT token.
 * Returns false if token is expired, tampered with, or if the server key is missing.
 *
 * @param {string | undefined} token - The session token retrieved from cookies.
 * @returns {Promise<boolean>} Resolves to true if verified successfully, otherwise false.
 */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const key = getSecretKey();
  if (!key) return false;
  try {
    await jwtVerify(token, key, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns standard configuration options for setting the HTTP cookie.
 * Secure flag is enforced in production to ensure cookie is only sent over HTTPS.
 * SameSite lax is set to mitigate CSRF attacks.
 *
 * @param {number} maxAge - The maximum age of the cookie in seconds.
 * @returns {object} The cookie options object.
 */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Validates the next redirect path to prevent open redirect vulnerabilities.
 * Sanitizes input to ensure it is a relative path starting with a single '/'
 * and does not contain protocol-relative prefix '//' or backslashes.
 *
 * @param {string | null | undefined} next - The requested redirect path.
 * @returns {string} A safe relative redirect URL, defaults to '/'.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || typeof next !== 'string') return '/';
  if (!next.startsWith('/')) return '/';
  if (next.startsWith('//') || next.startsWith('/\\')) return '/';
  return next;
}
