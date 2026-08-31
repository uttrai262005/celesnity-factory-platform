# Celesnity Factory Data & Production Line Platform

## Overview

A platform for an industrial laundry that processes hotel linen through six
fixed production steps (Receiving, Sorting, Washing, Drying, Ironing/Folding,
Packing & Dispatch). Operational data about work orders, batches, and events
is currently fragmented across an internal application, a supplier portal,
and a production database — so managers cannot see a trustworthy end-to-end
view of any given batch. This platform collects data from those sources,
normalizes it into a single traceable dataset, and uses that dataset to show
production-line status. It is a visibility and traceability tool. It does
not schedule work or control machines.

## Goals

1. Collect data from at least three independent local sources (Application
   API, supplier crawler, production database) into one normalized event
   model.
2. Every normalized record is traceable back to its exact source record and
   the collection run that produced it.
3. A manager can see, per line and per station, which batches are where,
   how much is WIP, how fresh the data is, and whether anything is stale,
   blocked, or missing data.
4. Every batch's state (`PLANNED` / `IN_PROGRESS` / `BLOCKED` / `COMPLETED`)
   is deterministic and reproducible from the event history — never a
   hand-set flag.
5. Manager actions (acknowledge, block, resume, note) are recorded as
   append-only events and never overwrite collected source history.

## Core User Flow

1. Manager opens **Data Sources**, registers the Application API source
   (base URL, auth if any), and clicks "Test connection."
2. Manager discovers available fields/schema for that source.
3. Manager selects which fields to collect and runs collection manually.
4. Manager inspects the run: status, duration, record counts, errors.
5. Manager repeats steps 1–4 for the supplier crawler and the production
   database connection.
6. Manager opens **Production Lines**, sees all six stations populated from
   normalized records, with WIP counts, current station per batch, and
   freshness indicators.
7. Manager clicks into a batch, sees its full event history with links back
   to the exact source record and collection run for each event.
8. Manager blocks a batch that has a quality issue, adds a note; the block
   appears as a management event, and the batch's derived state becomes
   `BLOCKED` without altering the underlying source records.
9. Manager resumes the batch; state returns to being derived normally from
   events again.

## Features

### Data Collection
- Register / edit / test a data source (API, crawler, database, MQTT-optional)
- Schema/field discovery per source type
- Field selection (choose what gets collected)
- Manual collection run (on demand — no scheduler in scope)
- Collection run history: status, duration, record counts, errors
- Malformed-row reporting that does not fail the whole run (crawler)

### Normalization
- Canonical event model shared across all sources, keyed by `workOrderId` /
  `batchId`
- Every normalized record stores `sourceType`, `sourceRecordId`, `runId`
- Deduplication of repeated observations of the same station event

### Production Line Management
- Per line/station view: assigned work orders & batches, current station,
  completed quantity, WIP, last event time, freshness, stale/blocked/
  missing-data/quality flags
- Deterministic state derivation (`PLANNED`/`IN_PROGRESS`/`BLOCKED`/`COMPLETED`)
- Batch detail view with full event history and provenance links
- Manager actions: acknowledge exception, block, resume, add note
  (append-only, actor + timestamp)

## Scope

### In Scope
- Application API collector (local REST fixture) with pagination, timeout,
  retry of transient failures
- Supplier crawler (local paginated HTML/JSON fixture) with anti-loop
  protection and malformed-row reporting
- Database connector against a local Postgres instance with credential-safe
  schema discovery
- Normalization pipeline producing canonical events with provenance
- Deterministic batch state machine
- Data Sources UI and Production Lines UI
- Manager management events (block/resume/note/acknowledge)

### Out of Scope
- MQTT telemetry collection (optional — build only if time remains after
  everything above is solid)
- Automatic schedule optimization or machine control of any kind
- Multi-tenant / multi-organization support beyond a single org scope field
  on management events
- Authentication/authorization system (assume a single trusted manager user
  for this assessment; do not build login)
- Real-time push updates (polling on manual refresh is sufficient)
- Historical analytics/reporting dashboards beyond the required indicators

## Success Criteria

1. Running `docker compose up` starts the API, web app, Postgres, and all
   three fixture sources with one command.
2. A manager can register and test all three required sources from the UI.
3. Running collection against all three sources produces normalized records
   covering all six stations, each traceable to its source record and run.
4. The Production Lines view shows correct, deterministic state for at
   least one complete batch (`PLANNED` → `IN_PROGRESS` → `COMPLETED`) and at
   least one `BLOCKED` batch.
5. A late-arriving event from an earlier station updates history but does
   not move a batch backwards in station progression.
6. Blocking/resuming/annotating a batch never mutates or deletes a
   previously collected source record.
