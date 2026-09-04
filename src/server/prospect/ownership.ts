import "server-only";
import { prisma } from "@/server/db";
import { isAdmin } from "@/server/auth/admin";

/**
 * Who may CHANGE a given prospect, as opposed to who may change prospects at all.
 *
 * Three widening circles, and this is the innermost:
 *
 *   signed in            -> may see the tool
 *   SDR_ACCESS_EMAILS    -> may create, and edit their own
 *   owner, or admin      -> may edit THIS one
 *
 * Matched on `owner_email`, which is written from the session at creation. The
 * form has no field that could stand in for it.
 */

function same(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Whether `email` may edit prospect `id`. Admins always may. */
export async function ownsProspect(
  id: string,
  email: string,
): Promise<boolean> {
  if (isAdmin(email)) return true;

  const row = await prisma.prospect.findUnique({
    where: { id },
    select: { ownerEmail: true },
  });

  // A missing prospect is not an ownership failure. Saying "you don't own this"
  // about something that no longer exists sends the SDR looking for a permission
  // problem; the mutation's own "that prospect no longer exists" is the truth.
  if (!row) return true;

  return same(row.ownerEmail, email);
}

/** Same rule, for a prospect already loaded — no second query. */
export function ownsLoadedProspect(ownerEmail: string, email: string): boolean {
  return isAdmin(email) || same(ownerEmail, email);
}
