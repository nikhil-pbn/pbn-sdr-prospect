import "server-only";
import { isAdmin } from "./admin";

/**
 * Who may create, edit and publish a prospect — the SDR team, from
 * `SDR_ACCESS_EMAILS`. The counterpart of PbN Proposals' `EDIT_ACCESS_EMAILS`,
 * renamed because the people are different: SDRs make prospects, AEs make
 * proposals, and one allowlist copied into the other tool would grant the wrong
 * team access to the wrong thing.
 *
 * `server-only` because this is an access decision and must never be reachable
 * from client code. The SDR roster (names, calendar links) arrives in Step 2 as
 * a separate, non-secret module.
 *
 * Admins are included deliberately. The alternative locks whoever runs this out
 * of the thing they maintain, and an admin will read every prospect anyway —
 * withholding the form is not a boundary, just an inconvenience.
 *
 * Empty or unset means only admins, matching `ADMIN_EMAILS`: a blank variable in
 * production must fail closed, never open. Signing in is still the separate,
 * earlier gate — this decides what a signed-in employee may WRITE.
 */
export function canCreateProspects(email: string): boolean {
  const wanted = email.trim().toLowerCase();
  const allowed = new Set(
    (process.env.SDR_ACCESS_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
  return allowed.has(wanted) || isAdmin(wanted);
}
