import "server-only";
import { NoAccess } from "@/components/auth/no-access";
import { NoSdrAccess } from "@/components/auth/no-sdr-access";
import { getCurrentUser } from "@/server/auth/current-user";
import { isAdmin } from "@/server/auth/admin";
import { canCreateProspects } from "@/server/auth/sdr-team";
import type { SessionUser } from "@/server/auth/session";

/**
 * Who may read analytics, decided in one place.
 *
 * Both analytics pages and the presence endpoint need the identical three-way
 * answer, and duplicating it is how one of them ends up a step behind the
 * others after a policy change. Returns the refusal SCREEN rather than throwing,
 * so a page stays a plain `return`.
 *
 * Admin-only, per the brief: this compares SDRs against each other, which is a
 * management view. The refusal splits because the two audiences need different
 * advice — an SDR still has the builder to go back to, while a reader off the
 * SDR list does not.
 */
export type AnalyticsGate =
  | { kind: "signin" }
  | { kind: "refused"; screen: React.ReactElement }
  | { kind: "ok"; user: SessionUser };

const ADMIN_ONLY =
  "Prospect analytics is limited to administrators. You're signed in — this account just isn't on the list.";

export async function requireAnalyticsAdmin(): Promise<AnalyticsGate> {
  const user = await getCurrentUser();
  if (!user) return { kind: "signin" };

  if (!isAdmin(user.email)) {
    return {
      kind: "refused",
      screen: canCreateProspects(user.email) ? (
        <NoAccess detail={ADMIN_ONLY} />
      ) : (
        <NoSdrAccess email={user.email} />
      ),
    };
  }

  return { kind: "ok", user };
}
