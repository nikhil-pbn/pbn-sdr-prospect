import type { ProspectInputErrors } from "@/server/validation/prospect-input";
import type { CtaInputErrors } from "@/server/validation/cta-input";

/**
 * What the Server Actions hand back to the client. Plain types and strings
 * only — imported by client components, so nothing `server-only` belongs here.
 * (A "use server" module may export nothing but async functions, which is why
 * the message constants live in this file and not in `actions.ts`.)
 */

/** Returned only on failure — a successful generation redirects and never returns. */
export type GenerateResult = {
  ok: false;
  message: string;
  fieldErrors?: ProspectInputErrors;
};

export type MutationResult = { ok: true } | { ok: false; message: string };

export type SaveCtaResult =
  { ok: true } | { ok: false; message: string; fieldErrors?: CtaInputErrors };

export const NOT_AN_SDR_MESSAGE =
  "Creating prospects is limited to the SDR team. Ask an administrator to add your address, then sign in again.";

export const NOT_THE_OWNER_MESSAGE =
  "This prospect belongs to another SDR. You can open it, but only its owner or an admin can change it.";

export const DATABASE_DOWN_MESSAGE =
  "The database isn't running, so the prospect couldn't be saved. Start it with `npm run db:up`, then try again — the form still has what you entered.";

/**
 * A stopped local database is by far the most common failure in this app, and
 * the raw Prisma message is a wall of bundler-mangled identifiers. This names
 * the actual problem and the actual fix instead.
 */
export function isDatabaseUnreachable(error: unknown): boolean {
  const raw = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  return (
    code === "ECONNREFUSED" ||
    code === "P1001" ||
    /ECONNREFUSED|Can't reach database server|Connection terminated/i.test(raw)
  );
}
