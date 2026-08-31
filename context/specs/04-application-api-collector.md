# Unit 04: Application API Collector

## Goal

`apps/api/src/collectors/application-api/` implements the shared
`Collector` interface against the Unit 03 fixture: connection test, schema
discovery, and a collection run with pagination, timeout, and retry of
transient failures. Raw results are written to `raw_records`.

## Design

No UI in this unit — verify via curl/Postman against `apps/api` endpoints
built in `sources/` and `runs/`.

## Implementation

### Collector interface

```
interface Collector {
  test(): Promise<{ ok: boolean; message?: string }>;
  discoverSchema(): Promise<SchemaDescriptor>;
  collect(config: RunConfig): Promise<CollectResult>;
}
```

### ApplicationApiCollector

- `test()` — calls fixture `/health` or a lightweight endpoint, returns
  ok/false with a message on failure.
- `discoverSchema()` — returns the four record types (workOrders, batches,
  receiving, dispatch) with their field names, so the UI (Unit 09) can let
  a manager pick which to collect.
- `collect(config)`:
  - Fetches all pages for each selected record type, following the
    pagination envelope until `data.length < pageSize`.
  - Per-request timeout (e.g. 5s) using `AbortController`.
  - Retry transient failures (timeout, 5xx) up to 3 attempts with backoff;
    a request that still fails after retries is recorded as a run error,
    not a crash.
  - Writes each fetched record as one row in `raw_records`
    (`source_id`, `run_id`, `raw_payload` = the record JSON, `ingested_at`).

### sources/ module (introduced here, extended in 05/06)

- `POST /sources` — register a source (type: `application-api`, config:
  base URL).
- `POST /sources/:id/test` — calls the collector's `test()`.
- `GET /sources/:id/schema` — calls `discoverSchema()`.

### runs/ module (introduced here, extended in 05/06/08)

- `POST /sources/:id/collect` — starts a run, calls `collect()`, tracks
  status (`running` → `succeeded`/`failed`), duration, per-type counts,
  and an error list.
- `GET /runs/:id` — run detail with status/duration/counts/errors.

## Dependencies

- `zod` — validate the fixture's response shape before writing to
  `raw_records`.

## Verify when done

- [ ] `test()` correctly reports failure when the fixture is down
- [ ] `discoverSchema()` returns all four record types with fields
- [ ] A full collection run against the fixture pages through all results
      correctly (verified with `pageSize` small enough to force >1 page)
- [ ] Triggering `X-Simulate-Failure: timeout` results in a retry, and
      after retries exhaust, the run still completes with that request
      logged as an error — it does not crash the whole run
- [ ] All fetched records land in `raw_records` with correct `source_id`
      and `run_id`
- [ ] `npm run build` passes
- [ ] `progress-tracker.md` updated: Unit 04 moved to Completed
