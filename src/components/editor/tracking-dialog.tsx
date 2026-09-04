"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrackingForm, type TrackingFormProps } from "./tracking-form";

/**
 * Opens once a prospect has published, and does not close until the tracking
 * entry is saved.
 *
 * Every escape route is closed deliberately: no X, no "Skip for now", Escape
 * ignored and clicks on the overlay ignored. Removing only the buttons would
 * have looked mandatory while still being one Esc keypress from being skipped,
 * which is worse than not trying — it reads as enforced and is not.
 *
 * The page is already live by this point, so nothing here blocks the prospect.
 * What it protects is the report: per-SDR totals are the entire reason the
 * table exists, and a skipped entry is a prospect nobody is credited for.
 *
 * Prefilled from the prospect so the common case is one click. The SDR can
 * correct the prospect's name or email, and the SDR name it is credited to.
 */
export function TrackingDialog({
  open,
  onOpenChange,
  ...formProps
}: TrackingFormProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Published — confirm tracking details</DialogTitle>
          <DialogDescription>
            The prospect page is live. These details are what the internal
            report uses to count prospects per SDR, so they&apos;re required.
          </DialogDescription>
        </DialogHeader>

        {/* Mounted only while open, so its state initialises from the current
            props every time. A reset effect would fight the React Compiler. */}
        {open && (
          <TrackingForm {...formProps} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
