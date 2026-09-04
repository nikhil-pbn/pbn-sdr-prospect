import "server-only";
import { prisma } from "@/server/db";
import { prospectUrlFor } from "@/utils/prospect-url";

/**
 * The SDR tracking log — the internal record of what was generated, for whom,
 * by which SDR, and the link that went out.
 *
 * Neither function here is admin-gated: both run as part of any SDR's own
 * generate-and-publish, and gating them would stop the tool working for
 * everyone who isn't an admin. The READ side — the per-SDR report — arrives
 * with the analytics in Step 5 and is gated there.
 */

/**
 * Written once per successful generation. Deliberately has no foreign key to
 * `prospects` — it must survive a prospect being removed, otherwise the log
 * develops holes precisely where someone cleaned up.
 */
export async function recordGeneration(input: {
  /** The SDR — the owner's name from the session. */
  sdrName: string;
  prospectName: string;
  prospectEmail: string;
  /** Absolute if NEXT_PUBLIC_APP_URL is set, else the path. */
  prospectUrl: string;
}): Promise<void> {
  await prisma.prospectTracking.create({ data: input });
}

/**
 * Confirms the log entry at publish time.
 *
 * The row is created when the prospect is generated, but the SDR may correct
 * the prospect's name or email in the dialog before publishing. So publish
 * updates the existing row rather than inserting a second one — inserting again
 * would double-count the prospect in the per-SDR totals, which is the number
 * this table exists to produce.
 */
export async function confirmTracking(input: {
  slug: string;
  sdrName: string;
  prospectName: string;
  prospectEmail: string;
}): Promise<void> {
  const existing = await prisma.prospectTracking.findFirst({
    // Matched on the trailing `/${slug}` rather than on equality, because the
    // stored URL is only absolute when NEXT_PUBLIC_APP_URL was set when the row
    // was written — a bare "/slug" from an environment without one still matches.
    where: { prospectUrl: { endsWith: `/${input.slug}` } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const data = {
    sdrName: input.sdrName,
    prospectName: input.prospectName,
    prospectEmail: input.prospectEmail,
    prospectUrl: prospectUrlFor(input.slug),
  };

  // Upsert by hand: there's no unique key on prospectUrl, and adding one would
  // make an environment change (a new NEXT_PUBLIC_APP_URL) a constraint failure.
  if (existing) {
    await prisma.prospectTracking.update({ where: { id: existing.id }, data });
  } else {
    await prisma.prospectTracking.create({ data });
  }
}
