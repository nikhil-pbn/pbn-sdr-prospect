"use client";

import { Eye } from "lucide-react";
import { ProspectRenderer } from "@/components/prospect/prospect-renderer";
import { PublishFlowDialogs } from "@/components/prospects/publish-flow-dialogs";
import { useProspectEditor } from "@/hooks/use-prospect-editor";
import type { SelectionMode as DbMode } from "@/generated/prisma/enums";
import type { SelectionMode } from "@/lib/prospect-options";
import type { ProspectPageContent } from "@/types/prospect-page";
import { CtaForm } from "./cta-form";
import { EditorToolbar } from "./editor-toolbar";
import { ProspectSummary } from "./prospect-summary";

export type EditorProspectProps = {
  id: string;
  slug: string;
  status: "Draft" | "Published";
  version: number;
  name: string;
  email: string;
  prospectRole: string | null;
  mode: DbMode;
  ownerName: string;
  ownerEmail: string;
  /** The linked CRM contact, or null — the HubSpot dialog then asks for one. */
  hubspotContactId: string | null;
};

/** The database enum → the form's lowercase mode, for the labels. */
const MODE_LABEL_KEY: Record<DbMode, SelectionMode> = {
  Category: "category",
  PainPoint: "pain_point",
};

/**
 * The editor: toolbar, the CTA form and summary on the left, and the page itself
 * on the right — the same renderer the public route uses, fed the saved content
 * with the CTA swapped for the unsaved draft. What the SDR sees here is what
 * publishing will make public.
 *
 * Publish runs the shared sequence — publish, HubSpot popup, tracking popup —
 * whose two dialogs are mounted here alongside the page.
 */
export function ProspectEditor({
  prospect,
  content,
  publicUrl,
  canEdit,
  hubspotEnabled,
}: {
  prospect: EditorProspectProps;
  content: ProspectPageContent;
  publicUrl: string;
  /** False when another SDR owns it: everything renders, nothing can be written. */
  canEdit: boolean;
  /** Decided on the server from the token's presence; the token itself never comes here. */
  hubspotEnabled: boolean;
}) {
  const editor = useProspectEditor({
    prospectId: prospect.id,
    publicUrl,
    initialCta: content.cta,
    hubspotEnabled,
    target: {
      sdrName: prospect.ownerName,
      prospectName: prospect.name,
      prospectEmail: prospect.email,
      hubspotContactId: prospect.hubspotContactId,
    },
  });

  const preview: ProspectPageContent = { ...content, cta: editor.cta };

  return (
    <div className="min-h-full bg-muted/40">
      <PublishFlowDialogs flow={editor.flow} />

      <EditorToolbar
        slug={prospect.slug}
        status={prospect.status}
        version={prospect.version}
        dirty={editor.dirty}
        canEdit={canEdit}
        hubspotEnabled={hubspotEnabled}
        copied={editor.copied}
        saving={editor.saving}
        publishing={editor.publishing}
        onCopyLink={editor.copyLink}
        onSave={() => void editor.save()}
        onPublish={editor.publish}
        onUnpublish={editor.unpublish}
        onOpenTracking={editor.openTracking}
        onOpenHubspot={editor.openHubspot}
      />

      <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <CtaForm
            cta={editor.cta}
            errors={editor.errors}
            disabled={!canEdit}
            onChange={editor.update}
          />
          <ProspectSummary
            name={prospect.name}
            email={prospect.email}
            prospectRole={prospect.prospectRole}
            mode={MODE_LABEL_KEY[prospect.mode]}
            ownerName={prospect.ownerName}
            sections={content.sections}
          />
        </aside>

        <section className="min-w-0 overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
            <Eye className="size-3.5" aria-hidden />
            Live preview — this is the page the prospect opens
          </div>
          <ProspectRenderer content={preview} />
        </section>
      </div>
    </div>
  );
}
