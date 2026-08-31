# Unit 05: Supplier Crawler + Fixture

## Goal

A local paginated supplier-portal fixture (HTML or JSON, either is fine —
JSON is faster to build and still exercises the same pagination/crawling
logic) plus `apps/api/src/collectors/supplier-crawler/` that crawls it for
delivery number, supplier, batch number, quantity, and delivery time —
covering the `RECEIVING` station. Must prevent pagination loops and report
malformed rows without failing the whole run.

## Design

No UI in this unit.

## Implementation

### fixtures/supplier-portal/

- `GET /deliveries?page=` — returns a page of delivery rows plus a "next
  page" link/token. Deliberately include:
  - One malformed row (e.g. missing `quantity` or non-numeric value) to
    exercise error handling.
  - A last page that either returns empty data or a `hasNext: false`
    flag — the crawler must recognize genuine termination.
  - A way to simulate a page that links back to a previous page (e.g. via
    a query param `X-Simulate-Loop: true`), used only in the crawler's own
    test, to prove loop protection works.
- Delivery row fields: `deliveryNumber`, `supplier`, `batchNumber`,
  `quantity`, `deliveryTime`. `batchNumber` must correspond to a
  `batchId` shared with the Application API fixture (per
  `project-overview.md`'s shared-ID requirement).

### SupplierCrawlerCollector

- `test()` — fetches page 1, confirms a 200 and expected shape.
- `discoverSchema()` — returns the five delivery fields.
- `collect(config)`:
  - Tracks visited page identifiers in a `Set`; if a page identifier
    repeats, stop and record it as a loop-prevention event in the run
    (not a crash).
  - Validates each row with zod; a row that fails validation is skipped
    and added to the run's error list with enough detail to identify it
    (e.g. row index + reason), and the run continues.
  - Writes valid rows to `raw_records` tagged `RECEIVING`.

## Dependencies

- `zod` (row validation)
- `cheerio` only if the fixture is HTML rather than JSON — prefer JSON to
  avoid this dependency and save time.

## Verify when done

- [ ] Crawler pages through all fixture pages and stops correctly at the
      real last page
- [ ] Triggering the loop-simulation flag causes the crawler to detect the
      repeat and stop, logging it — it does not hang or crash
- [ ] The malformed row is skipped, logged in the run's error list, and
      does not abort the rest of the run
- [ ] Valid rows appear in `raw_records` tagged with the `RECEIVING`
      station and share `batchId` values with Application API fixture data
- [ ] `npm run build` passes
- [ ] `progress-tracker.md` updated: Unit 05 moved to Completed
