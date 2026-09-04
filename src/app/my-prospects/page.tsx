import { Suspense } from "react";
import type { Metadata } from "next";
import { HomeHeader } from "@/components/home/home-header";
import {
  MyProspects,
  MyProspectsSkeleton,
} from "@/components/prospects/my-prospects";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { NoSdrAccess } from "@/components/auth/no-sdr-access";
import { getCurrentUser } from "@/server/auth/current-user";
import { canCreateProspects } from "@/server/auth/sdr-team";
import { PAGE_WIDTHS } from "@/utils/page-width";
import { parsePage } from "@/utils/pagination";
import { PROSPECT_SORT, PROSPECT_SORT_DEFAULT } from "@/utils/prospect-sort";
import { parseSort } from "@/utils/table-sort";

/** Reads the database, so never prerendered. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My prospects",
  // `robots` comes from the root layout; declaring it here would replace it.
};

export default async function MyProspectsPage(
  props: PageProps<"/my-prospects">,
) {
  const params = await props.searchParams;

  const user = await getCurrentUser();
  if (!user) {
    return (
      <SignInGate
        reason={typeof params.signin === "string" ? params.signin : undefined}
        path="/my-prospects"
      />
    );
  }

  // The SDR gate, same as the builder and the editor. Someone who cannot create
  // a prospect cannot own one either, so this page could only ever be an empty
  // table for them — and every control it offers is one they are refused.
  if (!canCreateProspects(user.email)) {
    return <NoSdrAccess email={user.email} />;
  }

  const page = parsePage(params.page);
  // Checked against the whitelist here, once, so nothing below has to wonder
  // whether the column it was handed is one the database can order by.
  const sort = parseSort(params, PROSPECT_SORT, PROSPECT_SORT_DEFAULT);

  return (
    <div className="min-h-full bg-muted/40">
      <HomeHeader user={user} current="my-prospects" width="wide" />

      <main className={`mx-auto w-full ${PAGE_WIDTHS.wide} px-6 py-10`}>
        <h1 className="text-2xl font-semibold tracking-tight">My prospects</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Everything you&apos;ve generated — draft or live, when it was made,
          and the link to send.
        </p>

        {/* `key` on the page and sort so navigating re-suspends and shows the
            skeleton, rather than holding the old rows while the query runs. */}
        <Suspense
          key={`${page}-${sort.key}-${sort.dir}`}
          fallback={<MyProspectsSkeleton sort={sort} />}
        >
          <MyProspects email={user.email} page={page} sort={sort} />
        </Suspense>
      </main>
    </div>
  );
}
