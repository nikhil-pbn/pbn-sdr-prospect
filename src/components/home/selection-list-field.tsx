"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  MODE_DETAILS,
  resolveSelections,
  type SelectionOptions,
} from "@/lib/prospect-options";
import type { ProspectInput } from "@/server/validation/prospect-input";

/**
 * The multi-select list for whichever mode is chosen. Each row is a label
 * wrapping its checkbox so the whole row toggles it.
 *
 * Selections are stored in `sortOrder`, via `resolveSelections`, no matter which
 * order the boxes were ticked — the same function the server uses, so what the
 * form holds is already what the prospect would be made of.
 */
export function SelectionListField({
  form,
  options,
}: {
  form: UseFormReturn<ProspectInput>;
  options: SelectionOptions;
}) {
  const mode = useWatch({ control: form.control, name: "mode" });
  const error = form.formState.errors.selections;

  if (!mode) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Choose Category / Solution or Pain Points above, and the list appears
        here.
      </div>
    );
  }

  const list = options[mode];
  const headingId = `selections-heading-${mode}`;

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Nothing to choose from — every entry in this list is retired in{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          src/content/catalog
        </code>
        .
      </div>
    );
  }

  return (
    <Controller
      control={form.control}
      name="selections"
      render={({ field }) => {
        const selected = new Set(field.value ?? []);

        function toggle(slug: string, checked: boolean) {
          const next = new Set(selected);
          if (checked) next.add(slug);
          else next.delete(slug);
          field.onChange(resolveSelections(list, [...next]).map((o) => o.slug));
        }

        return (
          <div role="group" aria-labelledby={headingId} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id={headingId} className="text-sm font-medium">
                {MODE_DETAILS[mode].listHeading}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {selected.size} of {list.length} selected
                </span>
                {selected.size > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => field.onChange([])}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {list.map((option) => {
                const id = `${mode}-${option.slug}`;
                const checked = selected.has(option.slug);

                return (
                  <label
                    key={option.slug}
                    htmlFor={id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-3.5 py-3 text-sm transition-colors hover:bg-muted/60",
                      checked &&
                        "border-primary bg-brand-muted hover:bg-brand-muted",
                    )}
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      aria-invalid={Boolean(error)}
                      onCheckedChange={(state) =>
                        toggle(option.slug, state === true)
                      }
                      onBlur={field.onBlur}
                    />
                    <span className="font-medium">{option.name}</span>
                  </label>
                );
              })}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
