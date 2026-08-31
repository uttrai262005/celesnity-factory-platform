# Unit 08: Production State Machine

## Goal

`apps/api/src/production/` derives deterministic batch/station state from
`canonical_events`, and owns append-only manager actions
(acknowledge/block/resume/note). Nothing here ever writes to
`canonical_events`.

## Design

No UI in this unit — verify via curl against the endpoints below.

## Implementation

### management_events schema (Prisma)

Fields: `id`, `batch_id`, `actor`, `action`
(`ACKNOWLEDGE`/`BLOCK`/`RESUME`/`NOTE`), `note_text` (nullable),
`org_scope`, `created_at`. Append-only — no update/delete endpoint exists
for this table.

### State derivation logic

Station order is fixed: `RECEIVING` → `SORTING` → `WASHING` → `DRYING` →
`FOLDING` → `DISPATCH`.

For a given batch:
- `current_station` = the furthest station in the fixed order that has at
  least one canonical event, **using the event with the latest
  `event_time` only to decide "did this station happen," never to move the
  pointer backwards** — i.e. compute `current_station` as
  `max(order_index)` over all stations with ≥1 event, not by "last event
  received."
- `PLANNED` — work order exists (from raw/canonical data) but no
  `RECEIVING` event exists yet.
- `IN_PROGRESS` — at least one production event exists and no `DISPATCH`
  event exists.
- `BLOCKED` — the batch's most recent `management_events` row (ordered by
  `created_at`) has `action = BLOCK` with no later `RESUME` for the same
  batch. `BLOCKED` overrides `IN_PROGRESS`/`PLANNED` for display purposes
  but does not erase the underlying station progression — resuming
  reveals the same `current_station` as before the block.
- `COMPLETED` — a `DISPATCH` canonical event exists.
- **Late event handling**: if a new canonical event arrives for a station
  earlier than `current_station`, it is stored (already true per Unit 07)
  and appears in event history, but `current_station` is recalculated with
  the "furthest station reached" rule above — so it cannot decrease.

### WIP and freshness

- Station WIP = count of batches whose derived `current_station` equals
  that station and whose state is not `COMPLETED`.
- Completed quantity per station = deduplicated quantity from canonical
  events at that station (already deduplicated in Unit 07 — this unit just
  sums the canonical rows, not raw rows).
- Freshness = `now - last_event_time` for the batch; `stale` if this
  exceeds the configurable threshold (default 15 minutes, via
  `STALE_THRESHOLD_MINUTES` env var).

### Endpoints

- `GET /production-lines/:lineId` — stations with WIP, batches, freshness,
  flags.
- `GET /batches/:batchId` — full derived state + event history +
  provenance links + management event history.
- `POST /batches/:batchId/acknowledge`
- `POST /batches/:batchId/block` (body: `{ actor, note }`)
- `POST /batches/:batchId/resume` (body: `{ actor }`)
- `POST /batches/:batchId/note` (body: `{ actor, note }`)

## Dependencies

- None new.

## Verify when done

- [ ] A batch with only a receiving event shows `PLANNED`... wait, correct
      per brief: `PLANNED` = work order exists but no receiving event; a
      batch with a receiving event and nothing else is `IN_PROGRESS`
      (verify this matches project-overview.md exactly before implementing)
- [ ] A batch with events at RECEIVING, SORTING, WASHING and a later,
      out-of-order RECEIVING-timestamped correction event does not move
      `current_station` backwards to RECEIVING
- [ ] Blocking a batch sets displayed state to `BLOCKED`; resuming returns
      it to the state derived from its events, unchanged
- [ ] Completed quantity at a station matches deduplicated canonical
      events, not a sum of raw duplicate observations
- [ ] No endpoint here ever writes to `canonical_events` or `raw_records`
- [ ] `npm run build` passes
- [ ] `progress-tracker.md` updated: Unit 08 moved to Completed
