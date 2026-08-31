# Unit 06: Database Connector + Fixture Seed

## Goal

A seeded Postgres "production database" fixture (a second schema/database
simulating Celesnity's production DB, separate from the platform's own
schema) plus `apps/api/src/collectors/database/` that verifies the
connection, discovers tables/columns, and collects a selected production
table — covering `SORTING`, `WASHING`, `DRYING`, `FOLDING`, and optionally
`DISPATCH` — without ever exposing credentials.

## Design

No UI in this unit.

## Implementation

### fixtures/production-db/seed.sql

- A `production_events` table simulating Celesnity's real production
  system: `id`, `work_order_id`, `batch_id`, `station_code`, `event_time`,
  `quantity`.
- Seed rows covering `SORTING`, `WASHING`, `DRYING`, `FOLDING` for the same
  `workOrderId`/`batchId` values used in Units 03 and 05, so cross-source
  joins in Unit 07 are provable.
- This table lives in a **separate** Postgres database/schema from the
  platform's own tables (simulating "an existing external database we
  don't own"), even though both run in the same `postgres` Docker service
  for simplicity.

### DatabaseCollector

- Connection config (host/port/db/user/password) comes from environment
  variables only (`PRODUCTION_DB_URL`), never accepted as free-text input
  from the API/UI — the "register a source" flow for this source type
  only lets the manager pick which already-configured connection to use
  and which table within it, per the invariant in `architecture.md`.
- `test()` — attempts a connection and a trivial query (`SELECT 1`);
  returns ok/false with a message that never includes the connection
  string.
- `discoverSchema()` — queries `information_schema.tables` and
  `information_schema.columns` for the production database, returns table
  names and their columns (so the manager picks `production_events` and
  its fields in the UI).
- `collect(config)` — runs a `SELECT` against the chosen table with the
  chosen columns, writes rows to `raw_records` tagged with the
  corresponding station code.

## Dependencies

- `pg` (raw driver for the second, external-simulated connection — Prisma
  stays scoped to the platform's own schema per `architecture.md`)

## Verify when done

- [ ] `test()` succeeds against the seeded fixture DB and fails gracefully
      (clear message, no crash) when pointed at a wrong port
- [ ] No log line, API response, or error message anywhere contains the
      database password or full connection string
- [ ] `discoverSchema()` correctly lists `production_events` and its
      columns
- [ ] Collection run writes rows tagged with the correct station codes and
      shares `batchId`/`workOrderId` with Units 03 and 05 data
- [ ] `npm run build` passes
- [ ] `progress-tracker.md` updated: Unit 06 moved to Completed
