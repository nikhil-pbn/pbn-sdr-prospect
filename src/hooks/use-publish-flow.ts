"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { publishProspect } from "@/server/prospect/actions";
import { useHubspotStep } from "./use-hubspot-step";

/**
 * Publish, then HubSpot, then tracking — in one place, for every page that can
 * publish.
 *
 *   Publish → public URL is live → HubSpot popup → write the link to the
 *   contact → tracking popup → save → complete
 *
 * Shared by the editor and the two list pages so that a Publish button in a
 * table cannot skip the two dialogs. The tracking entry is the number the SDR
 * report exists to produce, and nothing about a button in a table makes that
 * entry less necessary.
 *
 * The target is passed to `publish` rather than to the hook, so one instance
 * serves a whole table of rows instead of a hook and two dialogs per row.
 */

/** Everything the two dialogs need to know about the prospect being published. */
export type PublishTarget = {
  id: string;
  publicUrl: string;
  /** Prefills for the tracking form — correctable there. */
  sdrName: string;
  prospectName: string;
  prospectEmail: string;
  /** The linked CRM contact. Null means "ask for one", not "skip". */
  hubspotContactId: string | null;
};

export type PublishStep = "none" | "hubspot" | "tracking";

export function usePublishFlow({
  /** False when no HubSpot token is configured: the step is skipped entirely. */
  hubspotEnabled,
  /**
   * Run before publishing, and abort it by returning false. The editor flushes
   * unsaved CTA edits here — publishing stale content is the worst outcome
   * available.
   */
  beforePublish,
}: {
  hubspotEnabled: boolean;
  beforePublish?: () => Promise<boolean>;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<PublishTarget | null>(null);
  const [step, setStep] = useState<PublishStep>("none");
  /** Which row is mid-publish, so a table disables one button and not all of them. */
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishing, startPublishing] = useTransition();
  /**
   * Whether finishing with HubSpot hands on to tracking. True during a publish,
   * where this is one step of a sequence; false when the question is reopened
   * later, since tracking cannot be dismissed without saving and forcing it
   * open behind an unrelated action would be a trap rather than a prompt.
   */
  const [chain, setChain] = useState(true);

  const hubspot = useHubspotStep({
    onDone: () => setStep(chain ? "tracking" : "none"),
  });

  function publish(next: PublishTarget): void {
    setPublishingId(next.id);
    startPublishing(async () => {
      if (beforePublish && !(await beforePublish())) {
        setPublishingId(null);
        return;
      }

      const result = await publishProspect(next.id);
      setPublishingId(null);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Published — the link is live");
      router.refresh();

      // Live from here on. Everything below is bookkeeping and none of it can
      // unpublish what just went out.
      setTarget(next);
      setChain(true);
      if (hubspotEnabled) hubspot.ask();
      else setStep("tracking");
    });
  }

  /** Reopen the HubSpot question for something already published. */
  function openHubspot(next: PublishTarget): void {
    setTarget(next);
    setChain(false);
    hubspot.ask();
  }

  /** Reopen the tracking form — for an SDR who attributed one to the wrong person. */
  function openTracking(next: PublishTarget): void {
    setTarget(next);
    setChain(false);
    setStep("tracking");
  }

  function closeTracking(): void {
    setStep("none");
    router.refresh();
  }

  return {
    target,
    // The HubSpot dialog owns its own open state; tracking is a step of this one.
    step: hubspot.open ? ("hubspot" as const) : step,
    publishing,
    publishingId,
    hubspotPending: hubspot.pending,
    publish,
    openHubspot,
    openTracking,
    closeTracking,
    confirmHubspot: (url?: string) => {
      if (target) hubspot.confirm(target.id, url);
    },
    skipHubspot: hubspot.skip,
  };
}

export type PublishFlow = ReturnType<typeof usePublishFlow>;
