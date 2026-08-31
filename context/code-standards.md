# Code Standards

## General

- Keep modules small and single-purpose; one collector type per file/folder.
- Fix root causes — if a collector's retry logic is wrong, fix the retry
  logic, don't add a try/catch at the call site to hide it.
- Do not mix unrelated concerns in one file: a controller does not contain
  normalization logic, a collector does not contain state-derivation logic.

## TypeScript

- Strict mode (`strict: true`) throughout both `apps/api` and `apps/web`.
- No `any`. Use `unknown` at the boundary (raw payload from a collector)
  and narrow with a validation schema (zod) before it is trusted.
- Every raw payload from an external source (API fixture, crawler, DB,
  MQTT) is validated with a zod schema before being written to
  `raw_records`. Malformed input is caught here, not downstream.

## NestJS (Backend)

- One module per system boundary listed in `architecture.md`
  (`sources`, `collectors`, `normalization`, `production`, `runs`).
- Collectors implement a shared `Collector` interface:
  `test(): Promise<TestResult>`,
  `discoverSchema(): Promise<SchemaDescriptor>`,
  `collect(config: RunConfig): Promise<CollectResult>`.
  No collector-specific logic leaks outside its own module.
- Controllers are thin: parse/validate input (DTO + zod or class-validator),
  call a service method, return a typed response. No business logic in
  controllers.
- Use dependency injection for the Postgres client and for the fixture base
  URLs (from config), never hardcode `localhost:PORT` inline in a service.

## Next.js / React (Frontend)

- Default to server components; add `"use client"` only where interactivity
  (buttons, forms, polling) requires it.
- Route structure mirrors the two required pages: `app/data-sources/page.tsx`,
  `app/production-lines/page.tsx`. Shared components live in
  `apps/web/components/`.
- Data fetching goes through a small typed API client
  (`apps/web/lib/api-client.ts`) — no raw `fetch` calls scattered across
  components.
- No client-side state library beyond React state/`useState`/`useEffect`
  for this assessment's scope — it does not need Redux/Zustand.

## Styling

- Tailwind CSS utility classes only; use the tokens defined in
  `ui-context.md`. No hardcoded hex colors in components.
- Follow the border-radius scale defined in `ui-context.md`.

## API Routes

- Validate and parse request input (DTO/zod) before any logic runs.
- Every mutation (register source, run collection, block/resume/note)
  returns a consistent response shape: `{ data, error }`.
- Errors from collectors (timeout, tool/tool-call failure equivalent —
  transient fetch failure, malformed row) are captured into the run's
  error list, not thrown as unhandled 500s where avoidable.

## Data and Storage

- Raw payloads: JSONB in `raw_records`, never parsed into narrow columns
  (keep the original shape for traceability).
- Canonical events: typed columns (`work_order_id`, `batch_id`,
  `station_code`, `event_time`, `quantity`, `provenance_raw_record_id`).
- Never store the database connector's password/connection string in any
  table — it comes from environment variables at runtime only.

## File Organization

- `apps/api/src/sources/` — source registration, test-connection, schema
  discovery, field selection endpoints.
- `apps/api/src/collectors/{application-api,supplier-crawler,database,mqtt}/`
  — one collector implementation per source type.
- `apps/api/src/normalization/` — canonical event model + dedup logic.
- `apps/api/src/production/` — state derivation + management events.
- `apps/api/src/runs/` — collection run lifecycle tracking.
- `apps/web/app/data-sources/`, `apps/web/app/production-lines/` — pages.
- `apps/web/components/` — shared UI components (tables, badges, status
  indicators).
- `fixtures/application-api/`, `fixtures/supplier-portal/` — standalone
  Express (or NestJS) fixture servers, `fixtures/production-db/` — SQL seed
  scripts for the Postgres fixture database.
