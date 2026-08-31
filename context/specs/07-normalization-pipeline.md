# Unit 07: Normalization Pipeline

## Goal

`apps/api/src/normalization/` reads `raw_records` produced by any
collector and writes deduplicated `canonical_events`, each carrying full
provenance back to its source record and run. This is the only module
allowed to write `canonical_events` (architecture.md invariant #1).

## Design

No UI in this unit.

## Implementation

### canonical_events schema (Prisma)

Fields: `id`, `work_order_id`, `batch_id`, `station_code`, `event_time`,
`quantity`, `provenance_raw_record_id` (FK → `raw_records.id`),
`provenance_run_id`, `created_at`.

### Normalization service

- Triggered automatically at the end of a successful collection run (call
  it from `runs/` after a run completes, or as an explicit
  `POST /runs/:id/normalize` step — pick whichever is simpler to implement
  cleanly; document the choice in `progress-tracker.md`).
- For each raw record in the run:
  - Map source-specific fields to the canonical shape
    (`work_order_id`, `batch_id`, `station_code`, `event_time`, `quantity`)
    using a per-source-type mapper function.
  - Deduplicate: if a canonical event already exists for the same
    `(batch_id, station_code, event_time)` from the same or an equivalent
    source observation, do not insert a duplicate — this is what makes
    "completed quantity is deduplicated, not summed" (project brief)
    possible in Unit 08.
  - Insert one `canonical_events` row per genuinely new event, with
    `provenance_raw_record_id` pointing at the exact `raw_records` row it
    came from.

### Provenance query

- `GET /canonical-events/:id/provenance` — returns the canonical event
  plus its raw record and run metadata, for the UI's "link to contributing
  source records and collection run" requirement (Unit 10).

## Dependencies

- None new.

## Verify when done

- [ ] Running normalization after all three collectors (04/05/06) have run
      produces canonical events covering all six station codes for at
      least one shared `batchId`
- [ ] Running the same collection + normalization twice does not create
      duplicate canonical events for the same batch/station/time
- [ ] Every canonical event's provenance query correctly resolves back to
      one specific raw record and run
- [ ] `npm run build` passes
- [ ] `progress-tracker.md` updated: Unit 07 moved to Completed
