"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Copy,
  ExternalLink,
  Loader2,
  Rocket,
  Save,
  Share2,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prospectPathFor } from "@/utils/prospect-url";

export type EditorToolbarProps = {
  slug: string;
  status: "Draft" | "Published";
  version: number;
  dirty: boolean;
  /** False for a prospect owned by another SDR: readable, not writable. */
  canEdit: boolean;
  /** False when no HubSpot token is configured, which hides the HubSpot button. */
  hubspotEnabled: boolean;
  copied: boolean;
  saving: boolean;
  publishing: boolean;
  onCopyLink: () => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onOpenTracking: () => void;
  onOpenHubspot: () => void;
};

/** Spinner while a transition is pending, otherwise the action's own icon. */
function ActionIcon({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return pending ? (
    <Loader2 className="size-3.5 animate-spin" />
  ) : (
    <>{children}</>
  );
}

export function EditorToolbar({
  slug,
  status,
  version,
  dirty,
  canEdit,
  hubspotEnabled,
  copied,
  saving,
  publishing,
  onCopyLink,
  onSave,
  onPublish,
  onUnpublish,
  onOpenTracking,
  onOpenHubspot,
}: EditorToolbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-6 py-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="size-3.5" />
            New prospect
          </Link>
        </Button>

        <div className="mr-auto flex items-center gap-2">
          <Badge variant={status === "Published" ? "default" : "secondary"}>
            {status}
          </Badge>
          <span className="text-xs tabular-nums text-muted-foreground">
            v{version}
          </span>
          {dirty && canEdit && (
            <span className="text-xs font-medium text-brand-accent">
              Unsaved changes
            </span>
          )}
          {/* Said once, plainly, next to the disabled buttons — before they type,
              not after a failed save. */}
          {!canEdit && (
            <span className="text-xs font-medium text-muted-foreground">
              View only — another SDR owns this
            </span>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={onCopyLink}>
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          Copy link
        </Button>

        {status === "Published" && (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={prospectPathFor(slug)} target="_blank">
                <ExternalLink className="size-3.5" />
                Open
              </Link>
            </Button>
            {/* Reopen the tracking form after the fact — an SDR who credited it
                to the wrong person needs a way back in. Owner or admin only,
                like every other write. */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenTracking}
              disabled={!canEdit}
            >
              <ClipboardList className="size-3.5" />
              Tracking
            </Button>
            {/* Same idea for HubSpot: said no on publish, it failed, or the URL
                was never pasted on the form. Without this the only way back to
                that question was unpublishing and publishing again. */}
            {hubspotEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenHubspot}
                disabled={!canEdit}
              >
                <Share2 className="size-3.5" />
                HubSpot
              </Button>
            )}
          </>
        )}

        <Button
          size="sm"
          variant="secondary"
          onClick={onSave}
          disabled={saving || !dirty || !canEdit}
        >
          <ActionIcon pending={saving}>
            <Save className="size-3.5" />
          </ActionIcon>
          Save
        </Button>

        {status === "Draft" ? (
          <Button
            size="sm"
            onClick={onPublish}
            disabled={publishing || !canEdit}
          >
            <ActionIcon pending={publishing}>
              <Rocket className="size-3.5" />
            </ActionIcon>
            Publish
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={onUnpublish}
            disabled={publishing || !canEdit}
          >
            <ActionIcon pending={publishing}>
              <Undo2 className="size-3.5" />
            </ActionIcon>
            Unpublish
          </Button>
        )}
      </div>
    </header>
  );
}
