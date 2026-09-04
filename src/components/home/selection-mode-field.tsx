"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { CircleAlert, LayoutGrid, type LucideIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  MODE_DETAILS,
  SELECTION_MODES,
  type SelectionMode,
} from "@/lib/prospect-options";
import type { ProspectInput } from "@/server/validation/prospect-input";

const ICONS: Record<SelectionMode, LucideIcon> = {
  category: LayoutGrid,
  pain_point: CircleAlert,
};

/**
 * Category / Solution OR Pain Points — one or the other, never both. A radio
 * group is that rule made visible, and the two options are drawn as cards so
 * the whole card is the target, not a 16px circle.
 */
export function SelectionModeField({
  form,
  onModeChange,
}: {
  form: UseFormReturn<ProspectInput>;
  /** Fired AFTER the field updates, so the list below can be reset. */
  onModeChange: (mode: SelectionMode) => void;
}) {
  const error = form.formState.errors.mode;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">
        How should this prospect be built?
      </legend>

      <Controller
        control={form.control}
        name="mode"
        render={({ field }) => (
          <RadioGroup
            // "" rather than undefined keeps Radix in controlled mode throughout;
            // no item has an empty value, so nothing is checked.
            value={field.value ?? ""}
            onValueChange={(value) => {
              const mode = value as SelectionMode;
              field.onChange(mode);
              onModeChange(mode);
            }}
            aria-invalid={Boolean(error)}
            className="grid gap-3 sm:grid-cols-2"
          >
            {SELECTION_MODES.map((mode) => {
              const Icon = ICONS[mode];
              const details = MODE_DETAILS[mode];
              const id = `mode-${mode}`;
              const selected = field.value === mode;

              return (
                <label
                  key={mode}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-4 transition-colors hover:bg-muted/60",
                    selected &&
                      "border-primary bg-brand-muted hover:bg-brand-muted",
                  )}
                >
                  <RadioGroupItem id={id} value={mode} className="mt-0.5" />
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="size-4 text-brand-accent" aria-hidden />
                      {details.label}
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {details.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        )}
      />

      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </fieldset>
  );
}
