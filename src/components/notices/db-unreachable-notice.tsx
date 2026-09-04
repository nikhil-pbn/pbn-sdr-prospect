import { Database } from "lucide-react";

/**
 * Shown wherever a database read failed but the page is still usable. One
 * component, so the instruction can't drift between the pages that show it.
 */
export function DbUnreachableNotice({
  detail,
  className = "rounded-2xl border bg-card p-6 shadow-sm",
  hint,
}: {
  /** Raw error text, when there is somewhere sensible to show it. */
  detail?: string;
  className?: string;
  /** Extra sentence for contexts with a second likely cause. */
  hint?: string;
}) {
  return (
    <div className={`flex gap-3 text-sm ${className}`}>
      <Database
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div>
        <p className="font-semibold text-foreground">
          Can&apos;t reach the database
        </p>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          Start it with{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            npm run db:up
          </code>
          , then reload.
          {hint ? ` ${hint}` : ""}
        </p>
        {detail && (
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        )}
      </div>
    </div>
  );
}
