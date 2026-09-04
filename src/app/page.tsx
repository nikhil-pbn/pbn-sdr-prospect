import { Suspense } from "react";
import { HomeHeader } from "@/components/home/home-header";
import { HomeHero } from "@/components/home/home-hero";
import { ProspectForm } from "@/components/home/prospect-form";
import {
  RecentProspects,
  RecentProspectsSkeleton,
} from "@/components/home/recent-prospects";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { NoSdrAccess } from "@/components/auth/no-sdr-access";
import { getCurrentUser } from "@/server/auth/current-user";
import { canCreateProspects } from "@/server/auth/sdr-team";
import { isAdmin } from "@/server/auth/admin";
import { catalogOptions } from "@/content/catalog";
import { PAGE_WIDTHS } from "@/utils/page-width";

/** Reads the session cookie on every request, so never prerendered. */
export const dynamic = "force-dynamic";

export default async function HomePage(props: PageProps<"/">) {
  // Checked here rather than in a layout: a layout doesn't re-run on client
  // navigation, so the check would pass once and never fire again.
  const user = await getCurrentUser();
  if (!user) {
    const { signin } = await props.searchParams;
    return (
      <SignInGate reason={typeof signin === "string" ? signin : undefined} />
    );
  }

  // The form is the whole page, so there is nothing useful to show someone who
  // cannot submit it. The Server Action refuses them too — this only saves them
  // filling it in first.
  if (!canCreateProspects(user.email)) {
    return <NoSdrAccess email={user.email} />;
  }

  const admin = isAdmin(user.email);

  // The categories and pain points are code (content/catalog), so the form needs
  // no database to render. A stopped database only affects the list below it.
  const options = catalogOptions();

  return (
    <div className="min-h-full w-full bg-muted/40">
      <HomeHeader user={user} current="create" />

      <main className={`mx-auto w-full ${PAGE_WIDTHS.narrow} px-6 pb-20`}>
        <HomeHero />

        <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <ProspectForm
            sdr={{ name: user.name, email: user.email }}
            options={options}
          />
        </section>

        <section className="mt-20">
          {/* Own prospects only, so the list is one an SDR can actually act on.
              Admins get the team's, since for them every row is actionable. */}
          <Suspense fallback={<RecentProspectsSkeleton isAdmin={admin} />}>
            <RecentProspects email={user.email} isAdmin={admin} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
