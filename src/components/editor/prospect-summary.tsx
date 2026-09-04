import { TriangleAlert } from "lucide-react";
import { MODE_DETAILS, type SelectionMode } from "@/lib/prospect-options";
import type { ProspectPageSection } from "@/types/prospect-page";
import { isCopyPending } from "@/types/section-content";

/** The fixed frame around the selected sections, as the page renders it. */
const FRAME = { before: ["Header", "Hero"], after: ["Testimonials", "CTA"] };

/**
 * What this prospect is made of: who it is for, how it was built, and the page
 * order — fixed blocks greyed, selected sections named. Read-only by design.
 */
export function ProspectSummary({
  name,
  email,
  prospectRole,
  mode,
  ownerName,
  sections,
}: {
  name: string;
  email: string;
  prospectRole: string | null;
  mode: SelectionMode;
  ownerName: string;
  sections: ProspectPageSection[];
}) {
  const pending = sections.filter((section) => isCopyPending(section.content));

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">This prospect</h2>

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">For</dt>
        <dd className="font-medium">{name}</dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd className="truncate">{email}</dd>
        <dt className="text-muted-foreground">Role</dt>
        <dd className="truncate">{prospectRole || "—"}</dd>
        <dt className="text-muted-foreground">Built from</dt>
        <dd>{MODE_DETAILS[mode].label}</dd>
        <dt className="text-muted-foreground">SDR</dt>
        <dd>{ownerName}</dd>
      </dl>

      <h3 className="mt-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Page order
      </h3>
      <ol className="mt-2 space-y-1 text-sm">
        {FRAME.before.map((block) => (
          <li key={block} className="text-muted-foreground">
            {block}
          </li>
        ))}
        {sections.map((section) => (
          <li key={section.id} className="font-medium">
            {section.name}
          </li>
        ))}
        {FRAME.after.map((block) => (
          <li key={block} className="text-muted-foreground">
            {block}
          </li>
        ))}
      </ol>

      {pending.length > 0 && (
        <div
          role="status"
          className="mt-5 flex gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <p>
            Copy is still pending for{" "}
            <span className="font-semibold">
              {pending.map((section) => section.name).join(", ")}
            </span>
            . The page shows a &ldquo;[Copy pending]&rdquo; marker there until
            the predefined content is completed.
          </p>
        </div>
      )}
    </section>
  );
}
