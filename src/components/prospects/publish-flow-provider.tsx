"use client";

import { createContext, useContext } from "react";
import { PublishFlowDialogs } from "./publish-flow-dialogs";
import { usePublishFlow, type PublishFlow } from "@/hooks/use-publish-flow";

/**
 * One publish sequence for a whole table.
 *
 * Context rather than a hook per row: a table of fifty prospects would
 * otherwise hold fifty copies of the same state and mount a hundred dialogs, of
 * which at most one can ever be open. The rows only need to say "publish this
 * one".
 *
 * It also keeps the table itself a Server Component — only the buttons inside
 * it and this wrapper are client code.
 */
const FlowContext = createContext<PublishFlow | null>(null);

export function PublishFlowProvider({
  hubspotEnabled,
  children,
}: {
  hubspotEnabled: boolean;
  children: React.ReactNode;
}) {
  const flow = usePublishFlow({ hubspotEnabled });

  return (
    <FlowContext.Provider value={flow}>
      {children}
      <PublishFlowDialogs flow={flow} />
    </FlowContext.Provider>
  );
}

/**
 * Throws rather than returning null if the provider is missing. A row whose
 * Publish button silently did nothing would look like a permissions problem
 * and be debugged as one.
 */
export function useProspectPublishFlow(): PublishFlow {
  const flow = useContext(FlowContext);
  if (!flow) {
    throw new Error(
      "Row actions must be rendered inside <PublishFlowProvider>. Without it, " +
        "publishing would skip the HubSpot and tracking dialogs.",
    );
  }
  return flow;
}
