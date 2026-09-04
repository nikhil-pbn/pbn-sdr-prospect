import { Suspense } from "react";
import type { Metadata } from "next";
import { HomeHeader } from "@/components/home/home-header";
import {
  AllProspects,
  AllProspectsSkeleton,
} from "@/components/prospects/all-prospects";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { NoAccess } from "@/components/auth/no-access";
import { getCurrentUser } from "@/server/auth/current-user";
import { isAdmin } from "@/server/auth/admin";
import { PAGE_WIDTHS } from "@/utils/page-width";
import { parsePage } from "@/utils/pagination";
import { PROSPECT_SORT, PROSPECT_SORT_DEFAULT } from "@/utils/prospect-sort";
import { parseSort } from "@/utils/table-sort";

/** Reads the database, so never prerendered. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All prospects",
  // `robots` comes from the root layout; declaring it here would replace it.
};

export default async function AllProspectsPage(
  props: PageProps<"/all-prospects">,
) {
  const params = await props.searchParams;

  const user = await getCurrentUser();
  if (!user) {
    return (
      <SignInGate
        reason={typeof params.signin === "string" ? params.signin : undefined}
        path="/all-prospects"
      />
    );
  }

  // Admin only, per the brief. Not the SDR gate: an SDR who is not an admin has
  // My prospects for their own, and the team's belong to the people who run it.
  // The header never links here for anyone else, but the link was never the
  // control — this is.
  if (!isAdmin(user.email)) return <NoAccess />;

  const page = parsePage(params.page);
  const sort = parseSort(params, PROSPECT_SORT, PROSPECT_SORT_DEFAULT);

  return (
    <div className="min-h-full bg-muted/40">
      <HomeHeader user={user} current="all-prospects" width="wide" />

      <main className={`mx-auto w-full ${PAGE_WIDTHS.wide} px-6 py-10`}>
        <h1 className="text-2xl font-semibold tracking-tight">All prospects</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Every prospect the team has generated, with who made it and when.
        </p>

        <Suspense
          key={`${page}-${sort.key}-${sort.dir}`}
          fallback={<AllProspectsSkeleton sort={sort} />}
        >
          <AllProspects page={page} sort={sort} />
        </Suspense>
      </main>
    </div>
  );
}
