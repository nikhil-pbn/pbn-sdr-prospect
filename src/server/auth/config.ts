import "server-only";
import { appOrigin } from "./origin";

/** Re-exported so sign-in reads one module for everything it needs. */
export { appOrigin };

/**
 * Everything sign-in reads from the environment, in one place.
 *
 * Each getter throws with the fix in the message rather than returning
 * undefined: a missing secret that surfaces as "invalid signature" three files
 * later costs an hour, and these are only ever read on a real sign-in attempt,
 * so a throw here can never break `next build`.
 */

/**
 * The only domain allowed to sign in.
 *
 * A constant and not an env var on purpose. It does not vary between
 * environments, and an env var that was accidentally empty in production would
 * silently admit the entire internet — the exact failure this check exists to
 * prevent. Changing employer domain is a code change, and should be.
 */
export const ALLOWED_EMAIL_DOMAIN = "practicenumbers.com";

/**
 * Prefixed `pbn_prospects_` rather than PbN Proposals' `pbn_session`, so the two
 * tools can run on the same host (localhost:3000 in turn, or one domain later)
 * without one app's cookie being presented to the other.
 */
export const SESSION_COOKIE = "pbn_prospects_session";
export const OAUTH_STATE_COOKIE = "pbn_prospects_oauth_state";

/**
 * Where to go once signed in. A cookie rather than a second query parameter so
 * it cannot be swapped between the redirect to Google and the callback.
 */
export const OAUTH_RETURN_COOKIE = "pbn_prospects_oauth_return";

/** Seven days. Rotating SESSION_SECRET ends every session sooner than this. */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** The state cookie only has to survive one round trip to Google. */
export const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;

/**
 * A missing environment variable, distinguishable from anything else that goes
 * wrong mid-sign-in. "Try again in a moment" is useless advice when the server
 * will refuse identically until somebody edits an env file and redeploys, so
 * the routes catch this specifically and say so.
 */
export class AuthConfigError extends Error {
  constructor(name: string, hint: string) {
    super(`${name} is not set. ${hint}`);
    this.name = "AuthConfigError";
  }
}

function required(name: string, hint: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new AuthConfigError(name, hint);
  return value;
}

export function googleClientId(): string {
  return required(
    "GOOGLE_CLIENT_ID",
    "Create an OAuth client in Google Cloud console → Credentials, then copy it into .env.",
  );
}

export function googleClientSecret(): string {
  return required(
    "GOOGLE_CLIENT_SECRET",
    "It is shown once when the OAuth client is created; reset it in the console if lost.",
  );
}

export function sessionSecret(): Uint8Array {
  const secret = required(
    "SESSION_SECRET",
    "Generate one with `openssl rand -base64 32`.",
  );
  return new TextEncoder().encode(secret);
}

/**
 * Must equal the folder under `app/` that handles it, and the string registered
 * on the OAuth client. Declared once so those cannot drift: `/callback/google`
 * versus `/google/callback` is a `redirect_uri_mismatch` with nothing visibly
 * wrong at either end.
 */
export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

/**
 * The redirect URI, which Google compares as an exact string — a trailing
 * slash or http-vs-https mismatch is a hard `redirect_uri_mismatch`.
 *
 * Pinned to the configured origin so it stays the same value whether the browser
 * arrived at localhost or 127.0.0.1, which are different origins to Google and
 * only one of them is registered.
 */
export function callbackUrl(requestOrigin: string): string {
  return `${appOrigin(requestOrigin)}${GOOGLE_CALLBACK_PATH}`;
}

/**
 * Cookie flags shared by the session and the OAuth state cookie.
 *
 * `secure` is conditional. A `Secure` cookie is silently discarded over plain
 * http, so hardcoding `true` means sign-in appears to succeed on localhost and
 * then every page still shows the sign-in screen, with nothing logged anywhere.
 *
 * `sameSite: "lax"` is required, not a preference: the browser arrives back
 * from accounts.google.com on a cross-site navigation, and `strict` would
 * withhold the state cookie on exactly that request.
 */
export function cookieBaseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  } as const;
}
