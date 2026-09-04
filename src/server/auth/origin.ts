import "server-only";

/**
 * The origin this app is actually reached at.
 *
 * NEXT_PUBLIC_APP_URL wins over the request's own origin, and that is not a
 * preference — behind a proxy the request cannot know the answer.
 *
 * `new URL(request.url).origin` does NOT come from the `Host` header. Only
 * `X-Forwarded-Proto` is honoured, for the scheme; the host and port come from
 * the address the server is LISTENING on. In a container that is `0.0.0.0:3000`,
 * so every redirect built from it points at an address that means "all
 * interfaces" to the server and nothing at all to a browser. The app has to be
 * told its public address, because it cannot observe one.
 *
 * `experimental.trustHostHeader` is deliberately not used: it is experimental,
 * it hardcodes the scheme to https, and it would let a forgeable request header
 * decide where a freshly authenticated employee is sent.
 *
 * The request origin remains the fallback, so local development — where the
 * bind address genuinely is the public one — needs no configuration at all.
 */
export function appOrigin(requestOrigin: string): string {
  const fallback = requestOrigin.replace(/\/+$/, "");
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(
    /\/+$/,
    "",
  );
  if (!configured) return fallback;

  // Parsed, not merely read. Every redirect the sign-in flow produces is built on
  // this value, including the one that REPORTS a failure — so a typo here would
  // throw while constructing the error page. A bad value degrades to the request
  // origin and says so in the log.
  try {
    new URL(configured);
    return configured;
  } catch {
    console.error(
      `[auth] NEXT_PUBLIC_APP_URL is not a valid URL, ignoring it: ${configured}`,
    );
    return fallback;
  }
}
