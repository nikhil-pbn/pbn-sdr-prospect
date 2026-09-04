"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProspectInput } from "@/server/validation/prospect-input";

/**
 * Which HubSpot contact this prospect is for.
 *
 * Optional: the schema accepts a blank value. Filled in, the SDR is offered a
 * one-click push of the published link onto that contact; left blank, the
 * HubSpot dialog after publishing asks for the URL instead.
 *
 * A whole URL rather than a contact id, because the URL is what an SDR already
 * has on screen — asking for the id means asking them to find it, and the
 * portal id sitting next to it in the same URL is easy to grab by mistake.
 */
export function HubspotContactField({
  form,
}: {
  form: UseFormReturn<ProspectInput>;
}) {
  const error = form.formState.errors.hubspotContactUrl;

  return (
    <div className="space-y-2">
      <Label htmlFor="hubspotContactUrl" className="text-sm font-medium">
        HubSpot contact URL{" "}
        {/* <span className="font-normal text-muted-foreground">(optional)</span> */}
      </Label>
      <Input
        id="hubspotContactUrl"
        className="h-10"
        inputMode="url"
        placeholder="https://app.hubspot.com/contacts/21924079/record/0-1/123456789"
        autoComplete="off"
        aria-invalid={Boolean(error)}
        {...form.register("hubspotContactUrl")}
      />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}
