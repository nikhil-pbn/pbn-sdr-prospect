"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveProspectCta, unpublishProspect } from "@/server/prospect/actions";
import {
  ctaInputSchema,
  getCtaFieldErrors,
  type CtaInput,
  type CtaInputErrors,
} from "@/server/validation/cta-input";
import { usePublishFlow, type PublishTarget } from "./use-publish-flow";

/**
 * All of the editor's state and server round-trips, so the components stay
 * presentation only.
 *
 * The CTA draft lives here as plain state rather than in a form library: four
 * fields, and the preview has to re-render on every keystroke, which a
 * controlled object does for free.
 *
 * Publishing is deliberately NOT implemented here. It belongs to
 * `usePublishFlow`, shared with the list pages, so the HubSpot and tracking
 * steps cannot exist on one page and be missing from another.
 */
export function useProspectEditor({
  prospectId,
  publicUrl,
  initialCta,
  hubspotEnabled,
  target,
}: {
  prospectId: string;
  publicUrl: string;
  initialCta: CtaInput;
  hubspotEnabled: boolean;
  /** Identity and tracking prefills for the two post-publish dialogs. */
  target: Omit<PublishTarget, "id" | "publicUrl">;
}) {
  const router = useRouter();
  const [cta, setCta] = useState<CtaInput>(initialCta);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<CtaInputErrors>({});
  const [copied, setCopied] = useState(false);
  const [saving, startSaving] = useTransition();
  const [unpublishing, startUnpublishing] = useTransition();

  function update(patch: Partial<CtaInput>) {
    setCta((current) => ({ ...current, ...patch }));
    setDirty(true);
    // Typing into a field clears its error; the next save re-checks everything.
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as (keyof CtaInput)[]) {
        delete next[key];
      }
      return next;
    });
  }

  /** Resolves true when the save landed. Client validation first — no round trip for a blank title. */
  function save(options?: { silent?: boolean }): Promise<boolean> {
    return new Promise((resolve) => {
      const parsed = ctaInputSchema.safeParse(cta);
      if (!parsed.success) {
        setErrors(getCtaFieldErrors(parsed.error));
        toast.error("Please fix the highlighted fields.");
        resolve(false);
        return;
      }

      startSaving(async () => {
        const result = await saveProspectCta(prospectId, parsed.data);
        if (result.ok) {
          setDirty(false);
          if (!options?.silent) toast.success("Saved");
          router.refresh();
          resolve(true);
        } else {
          if (result.fieldErrors) setErrors(result.fieldErrors);
          toast.error(result.message);
          resolve(false);
        }
      });
    });
  }

  const flow = usePublishFlow({
    hubspotEnabled,
    // Publishing stale content is the worst outcome available here, so edits
    // are flushed first and a failed save aborts the publish.
    beforePublish: async () => !dirty || (await save({ silent: true })),
  });

  const publishTarget: PublishTarget = { id: prospectId, publicUrl, ...target };

  function unpublish() {
    startUnpublishing(async () => {
      const result = await unpublishProspect(prospectId);
      if (result.ok) {
        toast.success("Back to draft — the public link now 404s");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied", { description: publicUrl });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually.");
    }
  }

  return {
    cta,
    dirty,
    errors,
    copied,
    saving,
    // One button, two sources: publishing comes from the shared flow,
    // unpublishing is the editor's own.
    publishing: flow.publishing || unpublishing,
    flow,
    update,
    save,
    publish: () => flow.publish(publishTarget),
    unpublish,
    openTracking: () => flow.openTracking(publishTarget),
    openHubspot: () => flow.openHubspot(publishTarget),
    copyLink,
  };
}
