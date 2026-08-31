# Unit 10: Production Lines UI

## Goal

`apps/web/app/production-lines/page.tsx` shows the six-station line view
with WIP, freshness, and quality/stale/blocked flags, plus a batch detail
panel with full event history, provenance links, and manager actions
(acknowledge/block/resume/note) — this is the primary deliverable view for
the whole assessment.

## Design

Follow the "Production Lines page" layout pattern in `ui-context.md`: six
station columns in fixed order (RECEIVING → SORTING → WASHING → DRYING →
FOLDING → DISPATCH), each showing WIP count and batch cards. State colors
per the `--state-*` tokens (PLANNED gray, IN_PROGRESS blue, BLOCKED red,
COMPLETED green, stale uses the warning/amber token as an overlay
indicator regardless of state color).

## Implementation

### StationColumn component

- Header: station code (mono font) + WIP count.
- List of `BatchCard`s for batches whose `current_station` is this
  station and whose state is not `COMPLETED` (completed batches disappear
  from the active board — this is a live-status view, not a full history
  browser; full history is available via the batch detail panel).
- Freshness indicator: relative time since last event; if stale (per the
  configurable threshold from Unit 08), show the amber warning icon
  (`AlertTriangle` per `ui-context.md`).

### BatchCard component

- Batch ID (mono), work order ID (mono), completed quantity at this
  station, state badge, stale/blocked icon overlays.
- Click opens the batch detail panel (side sheet or modal — side sheet is
  cheaper to build and fine for this scope).

### BatchDetailPanel component

- Full state summary (current station, state, WIP contribution).
- Event history table (from `GET /batches/:batchId`): station, event
  time, quantity, source type, and a link to that event's raw record +
  run (provenance, per Unit 07's provenance endpoint) — satisfies "links
  to the contributing source records and collection run."
- Management event history: chronological list of
  acknowledge/block/resume/note actions with actor and timestamp.
- Action buttons: "Acknowledge," "Block" (opens a small note input),
  "Resume," "Add note" (note input) — each calls the corresponding Unit 08
  endpoint and refreshes the panel on success.

## Dependencies

- None new.

## Verify when done

- [ ] All six stations render in fixed order regardless of which have
      data yet
- [ ] WIP counts match what `GET /production-lines/:lineId` returns
      directly via curl
- [ ] Stale indicator appears correctly for a batch whose last event
      exceeds the configured threshold
- [ ] Blocking a batch from the UI immediately reflects `BLOCKED` state
      and a red indicator; resuming reverts to the derived state
- [ ] Batch detail panel's event history correctly links each event to
      its exact source record and run (spot-check at least one event per
      source type: API, crawler, database)
- [ ] Adding a note does not alter any existing event's data — verified
      by checking `canonical_events`/`raw_records` are unchanged
      (architecture.md invariant #3)
- [ ] Responsive at desktop and tablet width
- [ ] No console errors, no TypeScript errors
- [ ] `npm run build` passes
- [ ] `progress-tracker.md` updated: Unit 10 moved to Completed
