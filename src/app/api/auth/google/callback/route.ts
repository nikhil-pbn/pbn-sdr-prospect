import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AuthConfigError,
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  appOrigin,
  callbackUrl,
} from "@/server/auth/config";
import { identityFromCode } from "@/server/auth/google";
import { safeReturnPath } from "@/server/auth/return-path";
import { sessionCookieOptions, sessionToken } from "@/server/auth/session";

/**
 * Where Google sends the browser back to.
 *
 * This exact path is registered as the authorized redirect URI on the OAuth
 * client, and Google compares it as a string — so moving this folder, or
 * reordering a segment of it, is a `redirect_uri_mismatch` until the console is
 * updated to match. `callbackUrl()` is the one place that builds it.
 *
 * Every outcome — success or any failure — ends as a redirect back to the page
 * that showed the sign-in screen. There is no `/login` page to land on, so a
 * failure re-renders that same screen with `?signin=` explaining itself.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();

  // Falls back to "/" on its own if the cookie is missing or was tampered with.
  //
  // Resolved against the CONFIGURED origin, not the request's, so a deployment
  // behind a proxy does not bounce every login to its bind address. The path
  // itself is still sanitised by safeReturnPath; this pins the half of the URL
  // that one cannot check.
  const target = new URL(
    safeReturnPath(jar.get(OAUTH_RETURN_COOKIE)?.value),
    appOrigin(url.origin),
  );

  /** Both cookies are single-use, so they go either way. */
  function finish(reason?: string) {
    if (reason) target.searchParams.set("signin", reason);
    const response = NextResponse.redirect(target);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.delete(OAUTH_RETURN_COOKIE);
    return response;
  }

  // Wrapped because the happy path can still throw, and this route has no page to
  // fall back to. `identityFromCode` reports every Google-side failure by
  // RETURNING, so what reaches the catch is the local kind: a missing
  // SESSION_SECRET, or something genuinely unforeseen.
  //
  // `target` and `finish` are built above the try on purpose — the reply has to
  // exist before anything that might fail runs.
  try {
    // The user pressed Cancel, or Google refused the account outright — which is
    // what an "Internal" consent screen does to an outside address.
    if (url.searchParams.get("error")) return finish("cancelled");

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const expected = jar.get(OAUTH_STATE_COOKIE)?.value;

    if (!code || !state || !expected || state !== expected) {
      return finish("state");
    }

    const result = await identityFromCode({
      code,
      redirectUri: callbackUrl(url.origin),
    });
    if (!result.ok) return finish(result.reason);

    // Minted BEFORE the response is built: sessionToken throws when
    // SESSION_SECRET is missing, and doing it inline would have left a redirect
    // half-assembled with no session on it.
    const token = await sessionToken(result.identity);

    // Set on the response rather than through `cookies()`, so the Set-Cookie
    // header is unambiguously part of this redirect.
    const response = finish();
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("[auth] sign-in callback failed", error);
    return finish(error instanceof AuthConfigError ? "config" : "error");
  }
}
