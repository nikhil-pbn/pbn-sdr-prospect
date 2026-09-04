"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addProspectToHubspot } from "@/server/prospect/actions";

/**
 * The HubSpot question, wherever it is asked from.
 *
 * Owns only the dialog's own state. What happens NEXT is the caller's business —
 * after a publish it hands on to the tracking form, and when an SDR reopens it
 * from a toolbar or a row it must not, since the tracking dialog cannot be
 * dismissed without saving. `onDone` is how that decision stays out of here.
 *
 * Nothing in this file can affect a prospect. It is published and saved before
 * the question is ever asked; this only writes one property on a CRM contact,
 * plus the contact id when the SDR supplies it here rather than on the form.
 */
export function useHubspotStep({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startPending] = useTransition();

  function ask(): void {
    setOpen(true);
  }

  function close(): void {
    setOpen(false);
    onDone();
  }

  /**
   * "No" / "Skip". Deliberately writes nothing: the column already defaults to
   * NotAdded, and declining is not an event worth a round trip or a row change.
   */
  function skip(): void {
    close();
  }

  /**
   * "Yes". `contactUrl` is set only when the prospect had no contact linked and
   * the SDR pasted one into the dialog; the server stores it before pushing, so
   * a failure here still leaves a prospect that can be retried in one click.
   *
   * The transition keeps both buttons disabled, so a double click is one call.
   */
  function confirm(prospectId: string, contactUrl?: string): void {
    startPending(async () => {
      const result = await addProspectToHubspot(prospectId, contactUrl);
      if (result.ok) {
        toast.success("Added to the HubSpot contact");
      } else {
        // Says what did work first. The prospect is live either way, and an SDR
        // who reads only the first half of a toast must not think it isn't.
        toast.error(`Published, but not added to HubSpot: ${result.message}`, {
          // Longer than the default: this one names an env var or a HubSpot
          // property, and it is the only place that message is shown.
          duration: 12_000,
        });
      }
      close();
    });
  }

  return { open, pending, ask, skip, confirm };
}
