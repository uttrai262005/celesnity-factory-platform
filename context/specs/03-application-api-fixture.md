# Unit 03: Application API Fixture

## Goal

A standalone local REST fixture server (separate from `apps/api`) that
serves work orders, batches, receiving records, and dispatch records with
pagination — simulating Celesnity's "internal application" system. This is
test data infrastructure, not the platform itself.

## Design

No UI. This is a backend-only fixture service.

## Implementation

### fixtures/application-api/

A small standalone NestJS or Express app (Express is fine — this is a
fixture, not production code) exposing:

- `GET /work-orders?page=&pageSize=` — paginated list, each with
  `workOrderId`, `createdAt`, `lineId`.
- `GET /batches?page=&pageSize=` — each with `batchId`, `workOrderId`,
  `quantity`.
- `GET /receiving?page=&pageSize=` — each with `batchId`, `receivedAt`,
  `quantity`.
- `GET /dispatch?page=&pageSize=` — each with `batchId`, `dispatchedAt`,
  `quantity`.
- Standard pagination envelope: `{ data: [...], page, pageSize, total }`.
- A configurable failure mode via query param or header (e.g.
  `X-Simulate-Failure: timeout` / `X-Simulate-Failure: 500-once`) so Unit
  04's collector can be tested against transient failures deterministically.

### Six-step sample data

Generate fixture data so that, combined with the supplier crawler (Unit 05)
and database fixture (Unit 06), all six stations are covered, sharing
`workOrderId`/`batchId` values across sources per `project-overview.md`:

- This fixture supplies: Receiving-adjacent work order/batch identity data,
  and Dispatch records (station 6, `DISPATCH`).
- At least 5 work orders, each with 1–2 batches, so there's enough volume
  to demonstrate pagination (pageSize small enough, e.g. 2, that multiple
  pages are required).
- At least one batch that has no dispatch record yet (to later prove
  `IN_PROGRESS` state derivation) and one full batch with a dispatch record
  (to prove `COMPLETED`).

## Dependencies

- `express` (or reuse Nest in a second small app) — fixtures/application-api
  is a separate package, not part of `apps/api`.

## Verify when done

- [ ] All four endpoints return correctly paginated results
- [ ] `X-Simulate-Failure` header reliably reproduces a timeout and a
      transient 500 for testing Unit 04's retry logic
- [ ] Data covers at least one `PLANNED`-only, one `IN_PROGRESS`-only, and
      one fully `COMPLETED` batch by the time Units 05/06 are also done
- [ ] Fixture runs standalone via `npm run start` inside
      `fixtures/application-api/` without needing the rest of the stack
- [ ] Added as a service in `docker-compose.yml`
- [ ] `progress-tracker.md` updated: Unit 03 moved to Completed
