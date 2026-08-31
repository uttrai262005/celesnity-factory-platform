# Build Plan

Units in build order. Each has its own spec file. Do not start unit N+1
until unit N's verification checklist passes.

| # | Unit | What it builds | Depends on |
|---|---|---|---|
| 01 | Monorepo setup | `apps/api` (NestJS 11), `apps/web` (Next.js 16), shared TS config, empty but building | — |
| 02 | Docker Compose skeleton | `docker-compose.yml` wiring postgres + api + web (mosquitto added later in 11) | 01 |
| 03 | Application API fixture | Standalone Express/Nest fixture server serving work orders, batches, receiving, dispatch with pagination | 02 |
| 04 | Application API collector | `collectors/application-api` — test/discover/collect with pagination, timeout, retry | 03 |
| 05 | Supplier crawler + fixture | Local paginated supplier page fixture + `collectors/supplier-crawler` with anti-loop + malformed-row handling | 02 |
| 06 | Database connector + fixture | Seeded Postgres production table + `collectors/database` with schema discovery, credential-safe | 02 |
| 07 | Normalization pipeline | `normalization/` module: raw_records → canonical_events, dedup, provenance | 04, 05, 06 |
| 08 | Production state machine | `production/` module: derive PLANNED/IN_PROGRESS/BLOCKED/COMPLETED, WIP, freshness, management events | 07 |
| 09 | Data Sources UI | `apps/web/app/data-sources` — register/test sources, run collection, view run history | 04, 05, 06 |
| 10 | Production Lines UI | `apps/web/app/production-lines` — station view, batch detail, block/resume/note actions | 08 |
| 11 | MQTT (optional) | Mosquitto service + `collectors/mqtt` for washing/drying telemetry | 07 — build only if Units 01–10 are fully verified with time remaining |

## Ordering rationale

- Fixtures come before their collectors (03 before 04, fixture-in-05 before
  crawler-in-05, seed-in-06 before connector-in-06) — a collector with
  nothing to collect from can't be verified.
- All three required collectors (04, 05, 06) complete before normalization
  (07) — normalization needs raw records from all sources to prove
  cross-source dedup and shared `workOrderId`/`batchId` actually works.
- State machine (08) depends on normalization (07) — state is derived only
  from canonical events, never from raw records directly.
- Backend (03–08) fully precedes frontend (09–10) per "backend before
  frontend wiring" — UI is wired against a working, curl-tested API, not
  built in parallel with guesses about the response shape.
- MQTT (11) is last and explicitly optional — it has no dependents, so
  cutting it never blocks anything else.

## Merge/split notes

- Fixture + collector for the crawler are merged into one unit (05)
  because the crawler fixture has no standalone value on its own (unlike
  the Application API fixture, which is substantial enough — pagination,
  four record types — to verify independently in 03 before writing collector
  logic against it in 04).
- Database seed + connector are merged into one unit (06) for the same
  reason — the seed is a few SQL inserts, not worth a standalone unit.
