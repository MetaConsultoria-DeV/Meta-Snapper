import 'server-only';
import { timingSafeEqual } from 'node:crypto';

/**
 * Verificação de credenciais + rate limit do login.
 *
 * Usa `node:crypto`, por isso fica separado de `lib/auth.ts` (que é importado
 * pelo proxy). Só o Route Handler de login (`/api/auth/login`) importa este módulo.
 */

/** Comparação em tempo constante que não vaza o comprimento da string. */
/**
 * Performs a constant-time string comparison to prevent timing attacks.
 * It always performs the validation against both strings to avoid leaking string length details.
 *
 * @param {string} a - The first string to compare.
 * @param {string} b - The second string to compare.
 * @returns {boolean} True if the strings are identical, otherwise false.
 */
function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA); // maintains approximately constant time execution
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Validates login credentials against predefined environment variables (AUTH_USERNAME and AUTH_PASSWORD).
 * Evaluates both fields unconditionally (no short-circuiting) to prevent timing-based field discovery.
 * Returns false if environment variables are not configured.
 *
 * @param {string} username - The username provided in the login form.
 * @param {string} password - The password provided in the login form.
 * @returns {boolean} True if credentials match, otherwise false.
 */
export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.AUTH_USERNAME;
  const expectedPass = process.env.AUTH_PASSWORD;
  if (!expectedUser || !expectedPass) return false;

  // Evaluate both fields unconditionally (no short-circuiting) to prevent timing-based field discovery.
  const okUser = constantTimeEqual(username, expectedUser);
  const okPass = constantTimeEqual(password, expectedPass);
  return okUser && okPass;
}

// ---------------------------------------------------------------------------
// Rate limit (in-memory, instance-based; best-effort, suitable for single-instance).
// ---------------------------------------------------------------------------

/**
 * Representation of a login attempt log for a specific IP.
 * @typedef {Object} Attempt
 * @property {number} fails - Cumulative number of failed login attempts.
 * @property {number} firstAt - Timestamp in milliseconds of the first failure in the current window.
 * @property {number} lockedUntil - Timestamp in milliseconds until which the IP is blocked from logging in.
 */
type Attempt = { fails: number; firstAt: number; lockedUntil: number };

/** Maximum number of failed login attempts allowed before locking. */
const MAX_FAILS = 5;

/** Time window duration in milliseconds for tracking failures. */
const WINDOW_MS = 15 * 60 * 1000;

/** Lockout duration in milliseconds. */
const LOCK_MS = 15 * 60 * 1000;

/** In-memory registry of login attempts mapped by client IP. */
const attempts = new Map<string, Attempt>();

/**
 * Checks if the client IP is currently blocked by the rate limiter.
 * If the tracking window has elapsed, the record is discarded.
 *
 * @param {string} ip - The client's IP address.
 * @returns {{ allowed: boolean; retryAfter?: number }} Object specifying permission and lockout remaining time in seconds.
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry) return { allowed: true };

  if (entry.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  if (now - entry.firstAt > WINDOW_MS) {
    attempts.delete(ip);
  }
  return { allowed: true };
}

/**
 * Registers a failed login attempt for a specific IP.
 * Triggers the lockout period if failures exceed MAX_FAILS.
 *
 * @param {string} ip - The client's IP address.
 * @returns {void}
 */
export function registerFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { fails: 1, firstAt: now, lockedUntil: 0 });
    return;
  }
  entry.fails += 1;
  if (entry.fails >= MAX_FAILS) {
    entry.lockedUntil = now + LOCK_MS;
  }
}

/**
 * Resets the rate limiter registry for a specific IP (e.g. after a successful login).
 *
 * @param {string} ip - The client's IP address.
 * @returns {void}
 */
export function resetRateLimit(ip: string): void {
  attempts.delete(ip);
}

/**
 * Extracts the client's real IP address from HTTP request headers.
 * Correctly handles reverse proxies via X-Forwarded-For and X-Real-IP headers.
 *
 * @param {Request} req - The incoming HTTP Request object.
 * @returns {string} The resolved client IP address or 'unknown'.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
