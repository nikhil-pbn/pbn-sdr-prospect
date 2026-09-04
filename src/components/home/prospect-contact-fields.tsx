"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProspectInput } from "@/server/validation/prospect-input";
import { HubspotContactField } from "./hubspot-contact-field";

/**
 * Who the prospect page is for — the person the SDR just spoke with, their
 * role at the practice, and the HubSpot contact they are. Two rows of two: the
 * person on the first, and beside the role on the second the CRM record it all
 * ends up on, so the four short fields read as one block rather than a column.
 *
 * There are no fields for the SDR's own name or email, on purpose. The SDR is
 * whoever is signed in, the server reads that from the session, and a form
 * field for it would only be something to get wrong or to spoof.
 */
export function ProspectContactFields({
  form,
}: {
  form: UseFormReturn<ProspectInput>;
}) {
  const errors = form.formState.errors;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Prospect name
          </Label>
          <Input
            id="name"
            className="h-10"
            placeholder="Dr. Priya Patel"
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Prospect email
          </Label>
          <Input
            id="email"
            type="email"
            className="h-10"
            placeholder="priya@brightsmiledental.com"
            autoComplete="off"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prospectRole" className="text-sm font-medium">
            Prospect role{" "}
            {/* <span className="font-normal text-muted-foreground">(optional)</span> */}
          </Label>
          <Input
            id="prospectRole"
            className="h-10"
            placeholder="Office manager"
            autoComplete="organization-title"
            aria-invalid={Boolean(errors.prospectRole)}
            {...form.register("prospectRole")}
          />
          {errors.prospectRole && (
            <p className="text-sm text-destructive">
              {errors.prospectRole.message}
            </p>
          )}
        </div>

        <HubspotContactField form={form} />
      </div>
    </div>
  );
}
