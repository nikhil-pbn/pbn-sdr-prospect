import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  cookieBaseOptions,
  sessionSecret,
} from "./config";

/**
 * The signed session cookie. Stateless — there is no session table, so signing
 * out is deleting a cookie and nothing has to be reachable to verify one. This
 * is also why Step 1 needs no database at all.
 *
 * `googleId` is Google's `sub` claim, stored because it is the one identifier
 * that survives someone's address changing. Nothing reads it yet; prospect
 * ownership lands in Step 2, and this is available should it want to key on
 * something more stable than the email.
 */
export type SessionUser = {
  email: string;
  name: string;
  googleId: string;
};

/**
 * Signed, not encrypted. The contents are readable by anyone holding the
 * cookie — which is the signed-in employee themselves — and the signature is
 * what stops them editing it. Nothing secret goes in here.
 */
export async function sessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(sessionSecret());
}

export function sessionCookieOptions() {
  return { ...cookieBaseOptions(), maxAge: SESSION_MAX_AGE_SECONDS };
}

/**
 * The signed-in user, or null for anyone else.
 *
 * Every failure returns null rather than throwing: an expired cookie, a cookie
 * signed with a rotated secret and a hand-forged one are all just "not signed
 * in" as far as the caller is concerned. Pinning `algorithms` matters — without
 * it a token declaring `alg: none` would verify.
 */
export async function readSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ["HS256"],
    });

    const { email, name, googleId } = payload;
    if (
      typeof email !== "string" ||
      typeof name !== "string" ||
      typeof googleId !== "string"
    ) {
      return null;
    }

    return { email, name, googleId };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
