import "server-only";
import { prisma, Prisma } from "@/server/db";
import {
  MAX_ACTIONS_PER_SESSION,
  MAX_VISIT_ACTIVE_MS,
} from "@/utils/analytics-limits";

/**
 * Creates or updates the one row that represents this visit.
 *
 * A single `INSERT … ON CONFLICT … DO UPDATE` for every kind of activity, which
 * is what makes "one row per visitor arriving" work. Not a tidiness choice:
 * reading the row into JavaScript and writing it back would let two concurrent
 * reports overwrite each other, and clicks in particular arrive in bursts.
 * Every accumulation below happens inside Postgres.
 *
 * Returns false when the row was deliberately left alone — a replayed heartbeat.
 */
export async function touchVisit(input: {
  prospectId: string;
  visitorId: string;
  sessionId: string;
  kind: "View" | "Heartbeat" | "Click" | "Closed";
  durationMs: number;
  action?: string;
  /** Epoch seconds for a heartbeat; the visit ignores any stamp not greater. */
  beatSeq: number;
}): Promise<boolean> {
  const isView = input.kind === "View";
  const isClick = input.kind === "Click";
  const isClosed = input.kind === "Closed";
  // The goodbye also flushes the last slice of reading time, so it counts as a
  // beat for both the duration it carries and the replay guard.
  const carriesTime = input.kind === "Heartbeat" || isClosed;

  // Built by Postgres so an entry's `t` and the row's timestamps share one clock.
  const newAction = isClick
    ? Prisma.sql`jsonb_build_array(jsonb_build_object(
        -- ::text is required: jsonb_build_object takes "any", so Postgres cannot
        -- infer a bare parameter's type here and rejects the whole statement.
        'a', ${input.action}::text,
        't', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
      ))`
    : Prisma.sql`NULL::jsonb`;

  // `$executeRaw(Prisma.sql`…`)`, not the tagged-template form. As a tagged
  // template every ${} becomes a bound PARAMETER, so the jsonb fragment above
  // would be sent as a value instead of spliced into the statement.
  const affected = await prisma.$executeRaw(Prisma.sql`
    INSERT INTO prospect_analytics_events
      (id, prospect_id, visitor_id, session_id, views, active_ms, actions,
       last_beat_seq, closed_at, created_at, last_seen_at)
    VALUES (
      gen_random_uuid(), ${input.prospectId}::uuid, ${input.visitorId}::uuid,
      ${input.sessionId}::uuid,
      ${isView ? 1 : 0}, ${carriesTime ? input.durationMs : 0}, ${newAction},
      ${carriesTime ? input.beatSeq : 0},
      ${isClosed ? Prisma.sql`NOW()` : Prisma.sql`NULL`}, NOW(), NOW()
    )
    ON CONFLICT (session_id, prospect_id) DO UPDATE SET
      -- A reload inside the same visit raises views; unique views do not move,
      -- because they count distinct visitor_id across rows.
      views = prospect_analytics_events.views + ${isView ? 1 : 0},
      -- The replay guard, applied to the DURATION specifically. A goodbye can
      -- arrive twice and must not add its milliseconds twice. Capped so a client
      -- replaying beats with rising stamps cannot push this toward Int32.
      active_ms = LEAST(
        prospect_analytics_events.active_ms + CASE
          WHEN prospect_analytics_events.last_beat_seq < ${input.beatSeq}
            THEN ${carriesTime ? input.durationMs : 0}
          ELSE 0
        END,
        ${MAX_VISIT_ACTIVE_MS}
      ),
      last_beat_seq = GREATEST(
        prospect_analytics_events.last_beat_seq, ${carriesTime ? input.beatSeq : 0}
      ),
      actions = CASE
        WHEN excluded.actions IS NULL THEN prospect_analytics_events.actions
        -- Stops growing rather than erroring past the cap.
        WHEN jsonb_array_length(COALESCE(prospect_analytics_events.actions, '[]'::jsonb))
             >= ${MAX_ACTIONS_PER_SESSION}
          THEN prospect_analytics_events.actions
        ELSE COALESCE(prospect_analytics_events.actions, '[]'::jsonb) || excluded.actions
      END,
      -- Set on goodbye, and cleared by any LATER signal. Closing a tab fires a
      -- Heartbeat and a Closed stamped with the SAME epoch second, as two beacons
      -- that race; a stamp no newer than what has already been applied belongs to
      -- that same goodbye, not to a return, so it leaves this alone.
      closed_at = ${
        isClosed
          ? Prisma.sql`NOW()`
          : Prisma.sql`CASE
              WHEN prospect_analytics_events.last_beat_seq >= ${input.beatSeq}
                THEN prospect_analytics_events.closed_at
              ELSE NULL
            END`
      },
      last_seen_at = NOW()
    -- A goodbye is never dropped: setting closed_at is idempotent and the
    -- duration it carries is guarded above. Everything else still ignores a
    -- replayed beat outright.
    WHERE ${isClosed}::boolean = TRUE
       OR ${carriesTime}::boolean = FALSE
       OR prospect_analytics_events.last_beat_seq < ${input.beatSeq}
  `);

  return affected > 0;
}
