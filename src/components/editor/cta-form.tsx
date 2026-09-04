"use client";

import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CtaInput, CtaInputErrors } from "@/server/validation/cta-input";

type FieldProps = {
  id: keyof CtaInput;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/**
 * The one editable block. Four fields, written straight into the editor's draft
 * so the preview alongside updates as the SDR types.
 *
 * The lock line above the fields is the editor's whole V1 scope statement:
 * everything else on the page is fixed content and is not offered for editing.
 */
export function CtaForm({
  cta,
  errors,
  disabled,
  onChange,
}: {
  cta: CtaInput;
  errors: CtaInputErrors;
  disabled: boolean;
  onChange: (patch: Partial<CtaInput>) => void;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">Call to action</h2>
      <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 size-3 shrink-0" aria-hidden />
        Only this block is editable. The header, hero, solution sections and
        testimonials are fixed content.
      </p>

      <div className="mt-5 space-y-4">
        <Field id="title" label="Title" error={errors.title}>
          <Input
            id="title"
            value={cta.title}
            disabled={disabled}
            aria-invalid={Boolean(errors.title)}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </Field>

        <Field id="description" label="Description" error={errors.description}>
          <Textarea
            id="description"
            rows={3}
            value={cta.description}
            disabled={disabled}
            aria-invalid={Boolean(errors.description)}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </Field>

        <Field id="buttonText" label="Button text" error={errors.buttonText}>
          <Input
            id="buttonText"
            value={cta.buttonText}
            disabled={disabled}
            aria-invalid={Boolean(errors.buttonText)}
            onChange={(event) => onChange({ buttonText: event.target.value })}
          />
        </Field>

        <Field
          id="url"
          label="Calendar link"
          hint="Where both booking buttons go — the one in the hero and this one. Defaults to your calendar."
          error={errors.url}
        >
          <Input
            id="url"
            type="url"
            inputMode="url"
            value={cta.url}
            disabled={disabled}
            aria-invalid={Boolean(errors.url)}
            onChange={(event) => onChange({ url: event.target.value })}
          />
        </Field>
      </div>
    </section>
  );
}
