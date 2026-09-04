import { ALLOWED_EMAIL_DOMAIN } from "@/server/auth/config";

/**
 * What went wrong on the last sign-in attempt, keyed by the `?signin=` value
 * the callback route redirects with.
 *
 * Each message says what to do next. "Authentication failed" tells someone
 * standing at a locked door nothing they cannot already see.
 */
const MESSAGES: Record<string, string> = {
  domain: `That Google account isn't on ${ALLOWED_EMAIL_DOMAIN}. Sign in with your work account.`,
  unverified:
    "Google hasn't verified the address on that account, so it can't be used to sign in.",
  cancelled: "Sign-in was cancelled. Nothing was changed.",
  state: "That sign-in attempt expired before it finished. Try again.",
  exchange: "Google couldn't complete the sign-in. Try again in a moment.",
  config:
    "Sign-in isn't configured on this server yet — GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET or SESSION_SECRET is missing from .env.",
  // The catch-all, for a throw nothing anticipated. The detail is in the server
  // log; inventing a likely reason here would send people chasing the wrong one.
  error:
    "Something went wrong completing sign-in. The details were logged on the server. Try again, and tell an admin if it keeps happening.",
};

/** Null for a first visit, and for any value that isn't one we wrote. */
export function signInMessage(reason?: string): string | null {
  if (!reason) return null;
  return MESSAGES[reason] ?? MESSAGES.exchange;
}
