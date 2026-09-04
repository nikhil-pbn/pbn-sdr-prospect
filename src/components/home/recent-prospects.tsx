import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { DbUnreachableNotice } from "@/components/notices/db-unreachable-notice";
import { loadRecentProspects } from "@/server/prospect/recent";
import { RecentProspectRow } from "./recent-prospect-row";

/**
 * The heading names the scope, because five rows give no other clue about it:
 * an admin's list is the whole team's, an SDR's is only what they own.
 */
function Heading({ isAdmin }: { isAdmin: boolean }) {
  return (
    <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
      {isAdmin ? "Recent prospects" : "My recent prospects"}
    </h2>
  );
}

/**
 * Fetches its own data so the homepage can stream: the hero and the form paint
 * while this query is still running, instead of the whole page waiting on it.
 *
 * The same split as the list pages: an admin's rows come from All prospects,
 * an SDR's from My prospects — matched on the session email, so ownership is
 * never something the form could have set. "View all" goes to whichever of
 * the two pages this list is the top of.
 */
export async function RecentProspects({
  email,
  isAdmin,
}: {
  email: string;
  isAdmin: boolean;
}) {
  const recent = await loadRecentProspects(
    isAdmin ? undefined : { ownerEmail: email },
  );

  return (
    <>
      <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
        <Heading isAdmin={isAdmin} />
        {recent.ok && recent.rows.length > 0 && (
          <span className="flex items-baseline gap-3 text-xs text-muted-foreground">
            <span>{recent.rows.length} most recent</span>
            <Link
              href={isAdmin ? "/all-prospects" : "/my-prospects"}
              className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
            >
              View all
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </span>
        )}
      </div>

      {!recent.ok ? (
        <DbUnreachableNotice />
      ) : recent.rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center">
          <FileText
            className="mx-auto size-5 text-muted-foreground"
            aria-hidden
          />
          <p className="mt-3 text-sm font-medium">
            {isAdmin ? "No prospects yet" : "You haven't made one yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the form above to create the first one.
          </p>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
          {recent.rows.map((row) => (
            <RecentProspectRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * Matches the loaded list's shape so the swap doesn't shift the page — including
 * the heading, which differs by role and would otherwise change width mid-load.
 */
export function RecentProspectsSkeleton({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <div className="mb-3 px-1">
        <Heading isAdmin={isAdmin} />
      </div>
      <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
        {[0, 1, 2].map((row) => (
          <li key={row} className="flex items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-56 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </li>
        ))}
      </ul>
    </>
  );
}
