"use client";

import dynamic from "next/dynamic";
import type { PublishFlow } from "@/hooks/use-publish-flow";

/**
 * The two dialogs the publish sequence needs, mounted once per page.
 *
 * Both are lazy for real — this is a Client Component, so `next/dynamic`
 * genuinely code-splits here. Between them they pull in the Dialog primitive
 * and the tracking form, and neither is reachable until something publishes.
 */
const HubspotDialog = dynamic(() =>
  import("@/components/editor/hubspot-dialog").then((mod) => mod.HubspotDialog),
);

const TrackingDialog = dynamic(() =>
  import("@/components/editor/tracking-dialog").then(
    (mod) => mod.TrackingDialog,
  ),
);

export function PublishFlowDialogs({ flow }: { flow: PublishFlow }) {
  const target = flow.target;
  // Nothing has been published in this session yet, so neither dialog has a
  // prospect to talk about — and neither chunk is fetched.
  if (!target) return null;

  return (
    <>
      {flow.step === "hubspot" && (
        <HubspotDialog
          open
          contactId={target.hubspotContactId}
          publicUrl={target.publicUrl}
          pending={flow.hubspotPending}
          onConfirm={flow.confirmHubspot}
          onSkip={flow.skipHubspot}
        />
      )}

      {flow.step === "tracking" && (
        <TrackingDialog
          open
          onOpenChange={(next) => {
            if (!next) flow.closeTracking();
          }}
          prospectId={target.id}
          publicUrl={target.publicUrl}
          defaultSdrName={target.sdrName}
          defaultProspectName={target.prospectName}
          defaultProspectEmail={target.prospectEmail}
        />
      )}
    </>
  );
}
