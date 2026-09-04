import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  ALLOWED_EMAIL_DOMAIN,
  googleClientId,
  googleClientSecret,
} from "./config";

/**
 * The Google half of sign-in: build the authorize URL, then turn the code
 * Google sends back into a verified identity.
 *
 * No Google SDK. The scopes are `openid email profile` and nothing else — we
 * want to know who signed in, not to call Google APIs for them — so there is
 * no refresh token to store and nothing an SDK would manage. What is left is
 * one redirect, one POST and one JWT to check.
 */

const AUTHORIZE_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/** Google signs id_tokens with a rotating key; jose fetches and caches the set. */
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

/** Google has issued tokens under both spellings. Both are legitimate. */
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export function authorizeUrl(input: {
  state: string;
  redirectUri: string;
}): string {
  const params = new URLSearchParams({
    client_id: googleClientId(),
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: input.state,
    // A hint for the account picker, NOT a restriction — anyone can strip it
    // from the URL. The real check is the `hd` claim, verified below.
    hd: ALLOWED_EMAIL_DOMAIN,
    // Without this, a browser already signed into one Google account skips the
    // picker entirely, which strands anyone whose personal account is default.
    prompt: "select_account",
  });

  return `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

export type GoogleIdentity = {
  email: string;
  name: string;
  googleId: string;
};

/** Distinguishable so the sign-in screen can say which thing went wrong. */
export type SignInFailure = "exchange" | "unverified" | "domain";

export type IdentityResult =
  { ok: true; identity: GoogleIdentity } | { ok: false; reason: SignInFailure };

export async function identityFromCode(input: {
  code: string;
  redirectUri: string;
}): Promise<IdentityResult> {
  let idToken: string;

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: input.code,
        client_id: googleClientId(),
        client_secret: googleClientSecret(),
        redirect_uri: input.redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      // Google's body names the cause — redirect_uri_mismatch, invalid_client —
      // and without it this is unguessable from the outside.
      console.error(
        `[auth] token exchange failed (${response.status})`,
        await response.text(),
      );
      return { ok: false, reason: "exchange" };
    }

    const body: unknown = await response.json();
    const token = (body as { id_token?: unknown }).id_token;
    if (typeof token !== "string") return { ok: false, reason: "exchange" };
    idToken = token;
  } catch (error) {
    console.error("[auth] could not reach Google's token endpoint", error);
    return { ok: false, reason: "exchange" };
  }

  return verifyIdentity(idToken);
}

/**
 * The domain check — the "Internal" consent screen is belt, this is braces.
 *
 * Both halves are load-bearing. `hd` is the Workspace domain Google asserts,
 * and it is absent entirely on personal gmail.com accounts. The email suffix is
 * checked too because `hd` alone would accept a consumer account that somehow
 * carried the claim.
 */
async function verifyIdentity(idToken: string): Promise<IdentityResult> {
  let claims;

  try {
    const verified = await jwtVerify(idToken, JWKS, {
      issuer: ISSUERS,
      audience: googleClientId(),
    });
    claims = verified.payload;
  } catch (error) {
    console.error("[auth] id_token failed verification", error);
    return { ok: false, reason: "exchange" };
  }

  const email =
    typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";
  const domain = typeof claims.hd === "string" ? claims.hd.toLowerCase() : "";

  if (!email || claims.email_verified !== true) {
    return { ok: false, reason: "unverified" };
  }

  if (domain !== ALLOWED_EMAIL_DOMAIN) return { ok: false, reason: "domain" };
  if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
    return { ok: false, reason: "domain" };
  }

  return {
    ok: true,
    identity: {
      email,
      name: typeof claims.name === "string" ? claims.name : email.split("@")[0],
      googleId: String(claims.sub ?? ""),
    },
  };
}
