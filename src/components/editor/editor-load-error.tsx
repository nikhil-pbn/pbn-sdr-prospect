import { TriangleAlert } from "lucide-react";
import { DbUnreachableNotice } from "@/components/notices/db-unreachable-notice";
import type { SchemaProblem } from "@/server/prospect/queries";

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-2xl px-6 py-16">{children}</div>;
}

/**
 * A database outage shouldn't show the SDR a stack trace. A missing prospect is
 * a genuine 404 and is handled by the page; these two are different problems and
 * get different messages.
 */
export function EditorDbError({ detail }: { detail: string }) {
  return (
    <Frame>
      <DbUnreachableNotice
        className="rounded-lg border bg-muted/40 p-5"
        detail={detail}
        hint="If it was already running, restart the dev server so it picks up a changed DATABASE_URL."
      />
    </Frame>
  );
}

/** A section's stored content predates a schema change, so the page can't render it. */
export function EditorSchemaError({ problem }: { problem: SchemaProblem }) {
  return (
    <Frame>
      <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/8 p-5 text-sm">
        <TriangleAlert
          className="mt-0.5 size-4 shrink-0 text-destructive"
          aria-hidden
        />
        <div>
          <p className="font-medium text-foreground">
            One of this prospect&apos;s sections doesn&apos;t match the current
            content schema
          </p>
          <p className="mt-1 text-muted-foreground">
            {problem.path}: {problem.detail}
          </p>
          <p className="mt-2 text-muted-foreground">
            The section was probably written before a schema change. Re-run{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              npm run db:seed
            </code>{" "}
            to rewrite the predefined sections.
          </p>
        </div>
      </div>
    </Frame>
  );
}
