import Link from "next/link";
import { LineChart, List, Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { PbnLogo } from "@/components/brand/pbn-logo";
import { isAdmin } from "@/server/auth/admin";
import { PAGE_WIDTHS, type PageWidth } from "@/utils/page-width";
import type { SessionUser } from "@/server/auth/session";

/** The internal pages this header can sit on. */
export type HeaderPage =
  "create" | "my-prospects" | "all-prospects" | "analytics";

export function HomeHeader({
  user,
  current,
  width = "narrow",
}: {
  user: SessionUser;
  /** The page this header sits on, so it doesn't offer a link back to it. */
  current?: HeaderPage;
  /**
   * Must match the width of the page's own container, or the nav sits inset
   * from the content below it. Defaults to narrow, the builder's width.
   */
  width?: PageWidth;
}) {
  // Hiding a link is courtesy, not the control — every page behind these
  // enforces its own rule. Someone who types the URL still gets refused; this
  // only keeps the header from advertising dead ends.
  const admin = isAdmin(user.email);

  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div
        className={`mx-auto flex h-14 w-full ${PAGE_WIDTHS[width]} items-center gap-3 px-6`}
      >
        {/* Home. The mark and the product name are one link, not two. */}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md outline-offset-4 transition-opacity hover:opacity-90 focus-visible:outline-2"
        >
          <PbnLogo size="md" eager />
          <span aria-hidden className="h-5 w-px bg-border" />
          <span className="text-sm font-semibold tracking-tight">
            Prospects
          </span>
        </Link>

        {/* A link to the page you are already reading does nothing, so each
            one hides on its own page. */}
        <nav className="ml-auto flex items-center gap-1">
          {current !== "create" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <Plus className="size-3.5" />
                Create
              </Link>
            </Button>
          )}
          {/* First of the lists, because it is the one an SDR actually lives in. */}
          {current !== "my-prospects" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/my-prospects">
                <UserRound className="size-3.5" />
                My prospects
              </Link>
            </Button>
          )}
          {/* Admin only, per the brief — the page refuses everyone else too. */}
          {admin && current !== "all-prospects" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/all-prospects">
                <List className="size-3.5" />
                All prospects
              </Link>
            </Button>
          )}
          {/* Admin only as well: analytics compares SDRs against each other. */}
          {admin && current !== "analytics" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/analytics">
                <LineChart className="size-3.5" />
                Analytics
              </Link>
            </Button>
          )}
          <span aria-hidden className="mx-1 h-5 w-px bg-border" />
          <UserMenu user={user} />
        </nav>
      </div>
    </header>
  );
}
