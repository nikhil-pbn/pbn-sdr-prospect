import { Badge } from "@/components/ui/badge";
import type { ProspectListing } from "@/server/prospect/listing";
import { formatLongDate } from "@/utils/date";

/**
 * Whether a prospect's link reached its HubSpot contact.
 *
 * This column is the reason `hubspot_error` is a column at all. The
 * confirmation dialog reports a failure once, in a toast, to one person, and
 * then it is gone — without somewhere to read it afterwards a link that never
 * arrived in the CRM is indistinguishable from one that did.
 *
 * Four states, and the distinction between the middle two matters: "no contact"
 * means the SDR never linked one and was never asked, "Not added" means they
 * were asked and said no. Neither is a fault, and neither should read as one.
 */
export function HubspotCell({ row }: { row: ProspectListing }) {
  if (!row.hubspotContactId) {
    return (
      <span className="text-muted-foreground" title="No HubSpot contact linked">
        —
      </span>
    );
  }

  const contact = `Contact ${row.hubspotContactId}`;
  const synced = row.hubspotSyncedAt
    ? ` · ${formatLongDate(row.hubspotSyncedAt)}`
    : "";

  if (row.hubspotStatus === "Added") {
    return (
      <Badge variant="outline" title={`${contact}${synced}`}>
        Added
      </Badge>
    );
  }

  if (row.hubspotStatus === "Failed") {
    return (
      // The reason, in full, on hover — it names the env var or HubSpot
      // property that needs fixing, and truncating it would lose exactly that.
      <Badge
        variant="destructive"
        title={`${contact}${synced} — ${row.hubspotError ?? "no reason recorded"}`}
      >
        Failed
      </Badge>
    );
  }

  return (
    <span
      className="text-sm text-muted-foreground"
      title={`${contact} — the prospect link hasn't been added to it`}
    >
      Not added
    </span>
  );
}
