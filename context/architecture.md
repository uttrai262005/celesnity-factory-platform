# Architecture Context

## Stack

| Layer | Technology | Role |
|---|---|---|
| Backend framework | NestJS 11 (TypeScript, Node.js 22+) | Owns all API routes, collection orchestration, normalization, state derivation |
| Frontend framework | Next.js 16 (React 19) | Data Sources UI + Production Lines UI |
| Persistence | PostgreSQL 16 | Source of truth: raw collected records, normalized events, management events, run metadata |
| API style | REST | Contract between `apps/web` and `apps/api` |
| Runtime/orchestration | Docker Compose | Boots api, web, postgres, mosquitto, and fixture servers together |
| MQTT (optional) | Eclipse Mosquitto | Local telemetry simulation for washing/drying, only if time allows |
| ORM | Prisma | Schema migrations + typed queries against Postgres |
| Job execution | In-process NestJS service, triggered by REST endpoint (no queue) | Manual collection runs only — no scheduler in scope |

## System Boundaries

- `apps/api/src/sources/` — owns source registration, connection testing,
  schema discovery, field selection. Knows nothing about normalization or
  production state.
- `apps/api/src/collectors/` — one collector module per source type
  (`application-api`, `supplier-crawler`, `database`, `mqtt`). Each collector
  implements a shared `Collector` interface (`test()`, `discoverSchema()`,
  `collect(runConfig)`). Collectors write **raw** records only — they never
  write normalized events directly.
- `apps/api/src/normalization/` — reads raw collected records for a run and
  produces canonical events. Owns the shared event model and dedup logic.
  This is the only module allowed to write to the canonical events table.
- `apps/api/src/production/` — reads canonical events (read-only) and
  derives line/station/batch state. Owns the deterministic state machine.
  Also owns management events (block/resume/note/acknowledge) — these are
  written here, not in `normalization/`.
- `apps/api/src/runs/` — owns collection-run lifecycle (status, duration,
  counts, errors), independent of which collector ran.
- `apps/web/app/data-sources/` — Data Sources UI only. Talks to `sources/`
  and `runs/` endpoints.
- `apps/web/app/production-lines/` — Production Lines UI only. Talks to
  `production/` endpoints. Never calls collector endpoints directly.
- `fixtures/` — standalone local servers (Application API fixture, supplier
  portal fixture) plus SQL seed for the production database fixture. These
  simulate Celesnity's real systems; they are not part of the platform
  itself and ship as separate Docker services.

## Storage Model

- **PostgreSQL — raw_records**: append-only, one row per record ingested
  from any collector, with `source_id`, `run_id`, `raw_payload` (JSONB),
  `ingested_at`. Never updated after insert.
- **PostgreSQL — canonical_events**: normalized, deduplicated events keyed
  by `(work_order_id, batch_id, station_code)`, each with a
  `provenance_raw_record_id` foreign key back to `raw_records`. Append-only;
  a "late" event is inserted, never overwrites an earlier one.
- **PostgreSQL — management_events**: append-only actions taken by a
  manager (block, resume, note, acknowledge), each with `actor`,
  `timestamp`, `batch_id`, `org_scope`. Never mutated or deleted.
- **PostgreSQL — sources / collection_runs**: mutable configuration and
  run-status rows (these are metadata, not history, so updates are fine —
  e.g. a run's status field transitions from `running` to `succeeded`).
- No file/blob storage needed for this assessment — all payloads are small
  JSON and fit in Postgres JSONB.

## Auth and Access Model

- Single trusted manager user, no login flow (explicitly out of scope per
  `project-overview.md`).
- Database connector credentials are stored server-side only
  (environment variables read by `apps/api`), never returned to the
  frontend or logged. The "verify connection" endpoint returns only a
  boolean + optional error message, never the connection string.
- `org_scope` field exists on management events for future multi-tenant
  support but is hardcoded to a single value for this assessment.

## Invariants

1. Collectors (`collectors/`) never write to `canonical_events` — only
   `normalization/` may write there. This keeps provenance honest: every
   canonical event can always be traced to exactly one raw record.
2. A batch's derived station can never move backwards. An event timestamped
   earlier than the batch's current furthest station is stored in
   `canonical_events` (it updates history) but must not change
   `current_station` on the derived read model.
3. Management events (`management_events`) are append-only and are never
   used to overwrite or delete rows in `raw_records` or `canonical_events`.
   Blocking a batch adds a row; it never flips a flag on a collected event.
4. Database connector credentials never leave `apps/api`. No endpoint,
   log line, or error message may include the connection string or
   password.
5. State (`PLANNED`/`IN_PROGRESS`/`BLOCKED`/`COMPLETED`) is always computed
   from `canonical_events` + `management_events` at read time (or via a
   materialized/derived table rebuilt from them) — it is never set directly
   by an API call as a raw field.
6. The supplier crawler must terminate: it tracks visited page identifiers
   and stops if a page repeats, rather than looping indefinitely.
7. A malformed row from any collector is logged to that run's error list
   and skipped — it must never throw an unhandled exception that aborts
   the entire collection run.
