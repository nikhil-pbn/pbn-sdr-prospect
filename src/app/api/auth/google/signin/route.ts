import { NextResponse } from "next/server";
import {
  AuthConfigError,
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE_SECONDS,
  appOrigin,
  callbackUrl,
  cookieBaseOptions,
} from "@/server/auth/config";
import { authorizeUrl } from "@/server/auth/google";
import { safeReturnPath } from "@/server/auth/return-path";

/**
 * Starts sign-in. A GET route rather than a Server Action so the button is a
 * plain form submit — no JavaScript, and a browser that blocks it still works.
 * `next` therefore arrives in the query string whether it was a link or a form
 * field; the two produce the same request.
 *
 * `state` is a random value stored in a short-lived cookie and echoed back by
 * Google. The callback refuses anything that does not match, which is what
 * stops a third party from feeding the app an authorization code of their own.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  // The configured origin, for the same reason the callback uses it: a proxy that
  // forwards its own upstream address as Host would otherwise send the
  // misconfigured case to an address the browser cannot reach.
  const home = new URL("/", appOrigin(origin));

  // Everything is inside the try, not just the authorize URL. A throw from reading
  // a cookie flag or minting the state is just as fatal to the request, and this
  // is the one endpoint that has to work before a person can do anything at all.
  // `home` is deliberately built ABOVE it, so the reply always exists.
  try {
    // The page that showed the sign-in screen, so the user is put back where they
    // were instead of on the homepage. Sanitised before it is stored, not after
    // it comes back — see `safeReturnPath`.
    const returnTo = safeReturnPath(url.searchParams.get("next"));
    const state = crypto.randomUUID();
    const target = authorizeUrl({ state, redirectUri: callbackUrl(origin) });

    const shortLived = {
      ...cookieBaseOptions(),
      maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    };

    const response = NextResponse.redirect(target);
    response.cookies.set(OAUTH_STATE_COOKIE, state, shortLived);
    response.cookies.set(OAUTH_RETURN_COOKIE, returnTo, shortLived);
    return response;
  } catch (error) {
    // A 500 here reads as "the app is broken". The sign-in screen can name the
    // missing variable instead, which is the difference between a deploy someone
    // can fix in a minute and one they bisect for an hour.
    console.error("[auth] cannot start sign-in", error);
    home.searchParams.set(
      "signin",
      error instanceof AuthConfigError ? "config" : "error",
    );
    return NextResponse.redirect(home);
  }
}
