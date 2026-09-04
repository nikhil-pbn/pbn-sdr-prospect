import "server-only";
import { cache } from "react";
import { readSession, type SessionUser } from "./session";

/**
 * Who is asking. The one function pages, components and Server Actions call.
 *
 * Wrapped in React's `cache` so the cookie is read and its signature verified
 * once per request no matter how many components ask — the page, the header
 * and the action it submits to all get the same answer without three
 * verifications.
 *
 * Deliberately does NOT redirect on its own. There is no `/login` route to
 * redirect to: an anonymous visitor is shown `<SignInGate />` in place of the
 * page they asked for, so the caller decides what "signed out" looks like.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> =>
  readSession(),
);

/**
 * What a Server Action tells the browser when the session went away mid-visit.
 *
 * Actions are public HTTP endpoints, so each checks for itself rather than
 * trusting that the page rendering the button was ever gated.
 */
export const SIGNED_OUT_MESSAGE =
  "Your session has ended. Reload the page and sign in again.";
