import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { NoSdrAccess } from "@/components/auth/no-sdr-access";
import {
  EditorDbError,
  EditorSchemaError,
} from "@/components/editor/editor-load-error";
import { ProspectEditor } from "@/components/editor/prospect-editor";
import { getCurrentUser } from "@/server/auth/current-user";
import { canCreateProspects } from "@/server/auth/sdr-team";
import { hasHubspotToken } from "@/server/hubspot/client";
import { ownsLoadedProspect } from "@/server/prospect/ownership";
import { loadProspectForEditor } from "@/server/prospect/queries";
import { editorPathFor, prospectUrlFor } from "@/utils/prospect-url";

/** Always reflects the latest saved content. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit prospect",
  // `robots` comes from the root layout; declaring it here would replace it.
};

/** Prospect ids are UUIDs. Anything else is a 404, not a database error. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditorPage(props: PageProps<"/editor/[id]">) {
  const { id } = await props.params;
  const { signin } = await props.searchParams;

  // Before the prospect is fetched, so a signed-out visitor cannot learn whether
  // an id exists from the difference between a 404 and a sign-in screen. The path
  // is passed on so an SDR opening a link to a specific prospect returns to it.
  const user = await getCurrentUser();
  if (!user) {
    return (
      <SignInGate
        reason={typeof signin === "string" ? signin : undefined}
        path={editorPathFor(id)}
      />
    );
  }

  // Also before the fetch: every control on this page writes, so there is no
  // read-only version of it to fall back to for someone outside the team.
  if (!canCreateProspects(user.email))
    return <NoSdrAccess email={user.email} />;

  if (!UUID.test(id)) notFound();

  const result = await loadProspectForEditor(id);

  if (result.state === "db-error")
    return <EditorDbError detail={result.detail} />;
  // A real 404 response, not a 200 with a message.
  if (result.state === "not-found") notFound();
  if (result.state === "schema-error") {
    return <EditorSchemaError problem={result.problem} />;
  }

  const { prospect, content } = result;

  return (
    <ProspectEditor
      prospect={{
        id: prospect.id,
        slug: prospect.slug,
        status: prospect.status,
        version: prospect.version,
        name: prospect.name,
        email: prospect.email,
        prospectRole: prospect.prospectRole,
        mode: prospect.mode,
        ownerName: prospect.ownerName,
        ownerEmail: prospect.ownerEmail,
        hubspotContactId: prospect.hubspotContactId,
      }}
      content={content}
      publicUrl={prospectUrlFor(prospect.slug)}
      // Decided here, on the server: the token itself never reaches the client,
      // only whether one exists — which is all the toolbar needs to show the
      // HubSpot button or skip that step.
      hubspotEnabled={hasHubspotToken()}
      // Another SDR's prospect opens read-only: the page still renders in full,
      // but nothing can be written from it. The actions refuse too.
      canEdit={ownsLoadedProspect(prospect.ownerEmail, user.email)}
    />
  );
}
