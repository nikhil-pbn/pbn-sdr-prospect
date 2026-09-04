import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PbnLogo } from "@/components/brand/pbn-logo";
import { ALLOWED_EMAIL_DOMAIN } from "@/server/auth/config";
import { GoogleMark } from "./google-mark";
import { signInMessage } from "./sign-in-message";

/**
 * Shown in place of a page to anyone who isn't signed in.
 *
 * A component and not a `/login` route on purpose: the visitor stays on the URL
 * they asked for, and there is no public route that has to be carved out of the
 * protection rules. The public prospect page (Step 2, `/[slug]`) simply never
 * renders this.
 *
 * `path` is where to return to once signed in, and every caller should pass its
 * own — an SDR who opens a link straight to a prospect's editor should land back
 * on it, not on the homepage.
 *
 * The button submits a GET form rather than being a link, because an anchor puts
 * the sign-in endpoint in the browser's status bar for anyone hovering it. The
 * submit sends the same request and still does not wait on JavaScript.
 */
export function SignInGate({
  reason,
  path = "/",
}: {
  reason?: string;
  path?: string;
}) {
  const problem = signInMessage(reason);

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border bg-card p-8 shadow-sm">
        <PbnLogo size="lg" eager />

        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Sign in to continue
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          The SDR team&apos;s internal tool for building prospect pages. Use
          your Practice by Numbers Google account.
        </p>

        {problem && (
          <div
            role="alert"
            className="mt-5 flex gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 p-3.5 text-sm"
          >
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden
            />
            <p className="text-destructive">{problem}</p>
          </div>
        )}

        <form
          method="get"
          action="/api/auth/google/signin"
          className="mt-6 w-full"
        >
          <input type="hidden" name="next" value={path} />
          <Button type="submit" size="lg" variant="outline" className="w-full">
            <GoogleMark className="size-4" />
            Continue with Google
          </Button>
        </form>

        {/* Both halves, because the two gates are separate and being refused by
            the second one after passing the first is the confusing case. */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Any @{ALLOWED_EMAIL_DOMAIN} account can sign in. Creating prospects is
          limited to the SDR team.
        </p>
      </div>
    </main>
  );
}
