import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HomeHeader } from "@/components/home/home-header";
import { PAGE_WIDTHS } from "@/utils/page-width";
import { RangeFilter } from "@/components/analytics/range-filter";
import {
  ProspectAnalyticsDetail,
  ProspectDetailSkeleton,
} from "@/components/analytics/prospect-detail";
import { ActiveNow } from "@/components/analytics/active-now";
import { LiveRefresh } from "@/components/analytics/live-refresh";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { requireAnalyticsAdmin } from "@/server/analytics/access";
import { activeOnProspect, prospectIdentity } from "@/server/analytics/queries";
import { sdrByEmail } from "@/utils/sdr-roster";
import { parseDateRange } from "@/utils/date-range-params";

/** Aggregates live visits, so never prerendered. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prospect analytics",
  // `robots` comes from the root layout; declaring it here would replace it.
};

/** Prospect ids are UUIDs. Anything else is a 404, not a database error. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProspectAnalyticsPage(
  props: PageProps<"/analytics/[id]">,
) {
  const params = await props.searchParams;
  const gate = await requireAnalyticsAdmin();
  if (gate.kind === "signin") {
    return (
      <SignInGate
        reason={typeof params.signin === "string" ? params.signin : undefined}
        path="/analytics"
      />
    );
  }
  if (gate.kind === "refused") return gate.screen;

  const { id } = await props.params;
  if (!UUID.test(id)) notFound();

  // Before anything is aggregated: an id that is not a prospect is a 404, not an
  // empty dashboard.
  const prospect = await prospectIdentity(id);
  if (!prospect) notFound();

  const range = parseDateRange(params);
  const live = await activeOnProspect(prospect.id);
  const sdr =
    sdrByEmail(prospect.ownerEmail)?.name ||
    prospect.ownerName ||
    prospect.ownerEmail;

  return (
    <div className="min-h-full bg-muted/40">
      <HomeHeader user={gate.user} current="analytics" width="wide" />

      <main className={`mx-auto w-full ${PAGE_WIDTHS.wide} px-6 py-10`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {prospect.name}
          </h1>
          <div className="flex items-center gap-4">
            {/* The reason an SDR keeps this page open after sending a link. */}
            <ActiveNow
              prospectId={prospect.id}
              initial={{ open: live, prospects: [] }}
            />
            {/* Invisible: re-renders the numbers below every few seconds. */}
            <LiveRefresh />
          </div>
        </div>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          {prospect.prospectRole ? `${prospect.prospectRole} · ` : ""}
          {prospect.email} · sent by {sdr}
        </p>

        <RangeFilter range={range} basePath={`/analytics/${prospect.id}`} />

        <div className="mt-8">
          <Suspense
            key={`${range.key}-${range.from?.getTime() ?? "x"}`}
            fallback={<ProspectDetailSkeleton />}
          >
            <ProspectAnalyticsDetail prospect={prospect} range={range} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
