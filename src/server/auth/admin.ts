import "server-only";
import { getCurrentUser } from "./current-user";
import type { SessionUser } from "./session";

/**
 * Who is an admin, from the `ADMIN_EMAILS` allowlist.
 *
 * An env var rather than a `role` column: no migration, no promote/demote UI,
 * and changing who has access is editing one line and redeploying. The cost is
 * that it is a deploy-time decision, which is the right trade while this is a
 * handful of people. Same convention as PbN Proposals.
 *
 * Empty or unset means NOBODY is an admin. That is the safe direction to fail:
 * reading "unset" as "everyone" would turn a blank variable in production into
 * an open door, and blank variables in production are common.
 *
 * Today this widens the SDR list (admins may always create prospects). From
 * Step 4 it also gates All Prospects, and from Step 5 the analytics.
 */

function allowlist(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Case-insensitive, because Google's address casing is not guaranteed to match
 * however the allowlist was typed. Sign-in already lowercases what it stores;
 * this normalises both sides anyway so neither has to be trusted.
 */
export function isAdmin(email: string): boolean {
  return allowlist().has(email.trim().toLowerCase());
}

/**
 * One address to ask for access, from the front of `ADMIN_EMAILS`.
 *
 * The refusal screen is the only caller. "Ask an administrator" is not
 * actionable in a company where nobody knows who that is, and the allowlist is
 * already the answer to the question. Null when the variable is unset.
 */
export function accessRequestContact(): string | null {
  const [first] = allowlist();
  return first ?? null;
}

/**
 * Thrown by the data layer when a non-admin reaches admin-only data.
 *
 * Its own class so a caller can tell it apart from a database failure — the two
 * want completely different things on screen.
 */
export class AdminOnlyError extends Error {
  constructor() {
    super("This data is limited to administrators.");
    this.name = "AdminOnlyError";
  }
}

/**
 * Admin, or throw. Guards the data itself, so a caller added later cannot
 * expose it by forgetting to check. Pages check `isAdmin` first and render a
 * refusal screen; this fires only if something reaches the data directly.
 */
export async function assertAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) throw new AdminOnlyError();
  return user;
}
