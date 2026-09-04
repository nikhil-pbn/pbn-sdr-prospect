"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Rocket, Share2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unpublishProspect } from "@/server/prospect/actions";
import type { ProspectListing } from "@/server/prospect/listing";
import { prospectUrlFor } from "@/utils/prospect-url";
import { useProspectPublishFlow } from "./publish-flow-provider";

/**
 * Publish / unpublish / HubSpot for one row.
 *
 * Publish goes through the shared flow, NOT straight to the Server Action:
 * publishing from a table must run the same publish → HubSpot → tracking
 * sequence the editor does, because the tracking entry is the number the SDR
 * report exists to produce.
 *
 * Every action is re-checked on the server. The buttons being present is
 * convenience, not the control.
 *
 * No delete. Unpublishing is the reversible way to take a page down, and the
 * brief defines no delete flow.
 */
export function RowActions({
  row,
  hubspotEnabled,
}: {
  row: ProspectListing;
  hubspotEnabled: boolean;
}) {
  const router = useRouter();
  const flow = useProspectPublishFlow();
  const [pending, start] = useTransition();

  const published = row.status === "Published";
  // The shared flow reports which row it is working on, so one publish doesn't
  // disable every other row's buttons.
  const busy = pending || flow.publishingId === row.id;

  const target = {
    id: row.id,
    publicUrl: prospectUrlFor(row.slug),
    sdrName: row.ownerName,
    prospectName: row.name,
    prospectEmail: row.email,
    hubspotContactId: row.hubspotContactId,
  };

  function unpublish() {
    start(async () => {
      const result = await unpublishProspect(row.id);
      if (result.ok) {
        toast.success("Moved back to draft");
        // The row is server-rendered; without this the table still shows the
        // old status until a manual reload.
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => (published ? unpublish() : flow.publish(target))}
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : published ? (
          <Undo2 className="size-3.5" />
        ) : (
          <Rocket className="size-3.5" />
        )}
        {published ? "Unpublish" : "Publish"}
      </Button>

      {/* Only for something already live: HubSpot stores the public link, and a
          draft's link 404s. Says "Retry" when the last attempt failed, because
          that is a different decision from adding it for the first time. */}
      {hubspotEnabled && published && (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => flow.openHubspot(target)}
        >
          <Share2 className="size-3.5" />
          {row.hubspotStatus === "Failed" ? "Retry HubSpot" : "HubSpot"}
        </Button>
      )}
    </div>
  );
}
