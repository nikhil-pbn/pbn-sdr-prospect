"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmProspectTracking } from "@/server/prospect/actions";
import { formatLongDate } from "@/utils/date";

export type TrackingFormProps = {
  prospectId: string;
  publicUrl: string;
  defaultSdrName: string;
  defaultProspectName: string;
  defaultProspectEmail: string;
  onSaved?: () => void;
};

export function TrackingForm({
  prospectId,
  publicUrl,
  defaultSdrName,
  defaultProspectName,
  defaultProspectEmail,
  onSaved,
  onDone,
}: TrackingFormProps & { onDone: () => void }) {
  const [sdrName, setSdrName] = useState(defaultSdrName);
  const [prospectName, setProspectName] = useState(defaultProspectName);
  const [prospectEmail, setProspectEmail] = useState(defaultProspectEmail);
  const [saving, startSaving] = useTransition();

  function submit() {
    startSaving(async () => {
      const result = await confirmProspectTracking(prospectId, {
        sdrName,
        prospectName,
        prospectEmail,
      });
      if (result.ok) {
        toast.success("Tracking details recorded");
        onDone();
        onSaved?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    /*
      `min-w-0` is load-bearing, here and on the two columns below. DialogContent
      is a CSS grid, and a grid item's default `min-width: auto` refuses to
      shrink below its content's intrinsic width — two inputs side by side would
      otherwise hang out of the panel rather than wrap.
    */
    <form
      className="min-w-0 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="tracking-sdr">SDR</Label>
        {/* `required` so an empty field is caught by the browser before a round
            trip. The server checks the same fields regardless — this is the
            fast path, not the guarantee. */}
        <Input
          id="tracking-sdr"
          value={sdrName}
          onChange={(event) => setSdrName(event.target.value)}
          placeholder="Your name"
          required
          autoFocus
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="tracking-prospect">Prospect name</Label>
          <Input
            id="tracking-prospect"
            value={prospectName}
            onChange={(event) => setProspectName(event.target.value)}
            placeholder="Dr. Priya Patel"
            required
          />
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="tracking-email">Prospect email</Label>
          <Input
            id="tracking-email"
            type="email"
            value={prospectEmail}
            onChange={(event) => setProspectEmail(event.target.value)}
            placeholder="priya@brightsmiledental.com"
            required
          />
        </div>
      </div>

      {/* URL and date are recorded automatically — shown so the SDR can see
          exactly what gets logged, but not editable: the URL must match the live
          page, and the date is when it happened. */}
      <div className="space-y-1.5">
        <Label className="text-muted-foreground">
          URL &amp; date (recorded automatically)
        </Label>
        <div className="min-w-0 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          {/* Wrapped, not truncated: this is the exact string written to the
              log and the thing the SDR sends a dentist. An ellipsis would hide
              the end of the slug, which is the part that identifies the page. */}
          <p className="font-mono text-xs break-all">{publicUrl}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatLongDate(new Date())}
          </p>
        </div>
      </div>

      {/* No cancel. Saving is the only way out — see TrackingDialog. */}
      <DialogFooter className="gap-2 sm:gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Save tracking details
        </Button>
      </DialogFooter>
    </form>
  );
}
