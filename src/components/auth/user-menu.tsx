import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/server/auth/actions";
import type { SessionUser } from "@/server/auth/session";

/** First letters of the first two words — "Kelly Geisser" becomes "KG". */
function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

/**
 * Who is signed in, and the way out.
 *
 * Initials rather than the Google profile photo: the photo is a remote URL that
 * would need a `next/image` host allowlist and a third-party request on every
 * page, to show something two letters already say.
 *
 * Sign-out is a form posting to a Server Action, not an onClick — it works
 * before hydration, and it cannot be triggered by a stray GET the way a link
 * could be.
 */
export function UserMenu({ user }: { user: SessionUser }) {
  return (
    <div className="flex items-center gap-2">
      <span
        title={user.email}
        className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
      >
        {initials(user.name)}
      </span>

      <span className="hidden max-w-[14ch] truncate text-sm text-muted-foreground sm:inline">
        {user.name}
      </span>

      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="size-3.5" />
          <span className="sr-only sm:not-sr-only">Sign out</span>
        </Button>
      </form>
    </div>
  );
}
