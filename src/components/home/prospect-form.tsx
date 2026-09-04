"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SelectionOptions } from "@/lib/prospect-options";
import { generateProspect } from "@/server/prospect/actions";
import {
  prospectInputSchema,
  type ProspectInput,
} from "@/server/validation/prospect-input";
import { ProspectContactFields } from "./prospect-contact-fields";
import { SelectionModeField } from "./selection-mode-field";
import { SelectionListField } from "./selection-list-field";

export function ProspectForm({
  /**
   * The signed-in SDR, straight from the session. Display only — the server
   * re-reads the session itself and never accepts an identity from the form.
   */
  sdr,
  /** The active categories and pain points, loaded by the page from the database. */
  options,
}: {
  sdr: { name: string; email: string };
  options: SelectionOptions;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ProspectInput>({
    resolver: zodResolver(prospectInputSchema),
    // `mode` is deliberately absent: nothing is pre-chosen, so the SDR has to
    // say which kind of call it was.
    defaultValues: {
      name: "",
      email: "",
      prospectRole: "",
      hubspotContactUrl: "",
      selections: [],
    },
  });

  /** Switching mode empties the list — the two lists share no items. */
  function onModeChange() {
    form.setValue("selections", []);
    form.clearErrors("selections");
  }

  function onSubmit(values: ProspectInput) {
    setServerError(null);
    startTransition(async () => {
      // On success the action redirects to the editor, so nothing comes back.
      const result = await generateProspect(values);
      if (result?.ok === false) {
        setServerError(result.message);
        for (const [field, message] of Object.entries(
          result.fieldErrors ?? {},
        )) {
          form.setError(field as keyof ProspectInput, { message });
        }
      }
    });
  }

  return (
    // noValidate: the browser's own email bubble would pre-empt the schema's
    // messages, and the two disagree on wording.
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-7"
    >
      {/* Name, email, role and the HubSpot contact — the HubSpot field sits
          beside the role, inside the contact block. */}
      <ProspectContactFields form={form} />
      <SelectionModeField form={form} onModeChange={onModeChange} />
      <SelectionListField form={form} options={options} />

      {serverError && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-4 text-sm"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden
          />
          <p className="text-destructive">{serverError}</p>
        </div>
      )}

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {pending
            ? "Creating the prospect and opening the editor…"
            : `Creating as ${sdr.name}. You'll land in the editor, where you can adjust the call to action and publish.`}
        </p>

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="shadow-sm"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Generating…
            </>
          ) : (
            <>
              <Layers className="size-4" aria-hidden />
              Generate prospect
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
