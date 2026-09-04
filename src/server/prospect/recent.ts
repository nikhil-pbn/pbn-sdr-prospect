import "server-only";
import { prisma, type ProspectStatus } from "@/server/db";

export type RecentProspect = {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  status: ProspectStatus;
  version: number;
  updatedAt: Date;
};

export type RecentProspectsResult =
  { ok: true; rows: RecentProspect[] } | { ok: false };

/**
 * The homepage list is a convenience, not the point of the page — if the
 * database is unreachable the SDR should still see the form, so a failure here
 * degrades to a notice instead of a 500.
 *
 * Scoped to one owner unless the caller is an admin. Rows carry no owner an SDR
 * could act on, so a team-wide list would be full of prospects that open
 * read-only; admins keep the team-wide view because for them every row is
 * actionable.
 */
export async function loadRecentProspects(options?: {
  /** Omit — or pass undefined, for an admin — to load the whole team's. */
  ownerEmail?: string;
  limit?: number;
}): Promise<RecentProspectsResult> {
  // Case-insensitive: Google's address casing is not guaranteed to match what
  // was stored, and this is a display filter that must not silently show nothing.
  const owner = options?.ownerEmail?.trim().toLowerCase();

  try {
    const rows = await prisma.prospect.findMany({
      where: owner
        ? { ownerEmail: { equals: owner, mode: "insensitive" } }
        : {},
      // By last edit, not creation: the reason to glance at this list is to
      // pick up whatever you were last working on.
      orderBy: { updatedAt: "desc" },
      take: options?.limit ?? 5,
      select: {
        id: true,
        slug: true,
        name: true,
        ownerName: true,
        status: true,
        version: true,
        updatedAt: true,
      },
    });
    return { ok: true, rows };
  } catch {
    return { ok: false };
  }
}
