"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hubspotContactIdFrom } from "@/utils/hubspot-contact-url";

/**
 * Asked after a prospect publishes: should its link go on the HubSpot contact?
 *
 * Two shapes, decided by whether a contact was linked when the prospect was
 * generated. With one, this is a yes/no. Without one, it asks for the URL here —
 * the alternative was an SDR who forgot the field having no way to fix it short
 * of generating the whole prospect again.
 *
 * Only ever opened on publish SUCCESS, or later from a row or the toolbar for
 * something already published, so the URL below is always live and the question
 * is never hypothetical. Neither answer can undo the publish.
 *
 * Dismissal is closed off the way the tracking dialog closes it — no X, no
 * Escape, no click-outside — because both buttons continue the flow and a
 * dialog that can be dropped halfway leaves a step silently skipped. Nobody is
 * trapped: skipping is one click and writes nothing.
 */
export function HubspotDialog({
  open,
  contactId,
  publicUrl,
  pending,
  onConfirm,
  onSkip,
}: {
  open: boolean;
  /** Null when nothing was linked — that is what turns this into a prompt. */
  contactId: string | null;
  publicUrl: string;
  pending: boolean;
  /** `url` is passed only when the SDR typed one here. */
  onConfirm: (url?: string) => void;
  onSkip: () => void;
}) {
  const [url, setUrl] = useState("");

  // What the app will actually store, echoed back live so a mistyped URL is
  // caught here rather than by a 404 from HubSpot.
  const typedId = hubspotContactIdFrom(url);
  const target = contactId ?? typedId;

  return (
    <Dialog open={open}>
      <DialogContent
        className="min-w-0 sm:max-w-lg"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add this prospect to HubSpot?</DialogTitle>
          <DialogDescription>
            The prospect page is published and the link below is live.{" "}
            {contactId
              ? `We can write it to contact ${contactId} as its Prospect Link.`
              : "Paste the contact's HubSpot URL to write it there as the Prospect Link."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-1.5">
          {/* `break-all` and `min-w-0`: DialogContent is a grid, whose items
              refuse to shrink below their content, and a URL has no spaces to
              wrap at. */}
          <p className="text-sm text-muted-foreground">Prospect link</p>
          <div className="min-w-0 rounded-md border bg-muted/40 px-3 py-2">
            <p className="font-mono text-xs break-all">{publicUrl}</p>
          </div>
        </div>

        {!contactId && (
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="hubspot-contact">HubSpot contact URL</Label>
            <Input
              id="hubspot-contact"
              inputMode="url"
              placeholder="https://app.hubspot.com/contacts/21924079/record/0-1/123456789"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={pending}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {/* Silent until they type: an error message on an untouched
                  optional field reads as a demand, and skipping is valid. */}
              {url.trim() && !typedId
                ? "That doesn't look like a HubSpot contact URL."
                : typedId
                  ? `Contact ${typedId} — this is also saved with the prospect, so it can be retried later.`
                  : "Open the contact in HubSpot and copy the address bar."}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {/* Both disabled in flight, so an impatient second click can't fire a
              second PATCH — and skip can't race past a confirm. */}
          <Button variant="outline" onClick={onSkip} disabled={pending}>
            {contactId ? "No" : "Skip"}
          </Button>
          <Button
            onClick={() => onConfirm(contactId ? undefined : url.trim())}
            disabled={pending || !target}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Yes, add to HubSpot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
