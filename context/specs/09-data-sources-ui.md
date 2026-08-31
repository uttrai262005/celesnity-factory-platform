# Unit 09: Data Sources UI

## Goal

`apps/web/app/data-sources/page.tsx` lets a manager register/test all
three required sources, run collection manually, and inspect run history —
covering the full "register → discover → select → run → inspect → preview"
workflow from `project-overview.md`.

## Design

Follow the "Data Sources page" layout pattern in `ui-context.md`: source
cards at top, run history table below. Use `StatusBadge` for
test/run status (colors per `ui-context.md` state tokens). Use
`--font-mono` for source IDs and run IDs in the table.

## Implementation

### lib/api-client.ts

Typed client wrapping the endpoints from Units 04/05/06/07:
`registerSource`, `testSource`, `discoverSchema`, `startCollection`,
`getRun`, `listRuns`.

### SourceCard component

- Shows source type icon, name, last test result (badge), "Test
  connection" button, "Run collection" button (disabled until a
  successful test).
- Clicking "Test connection" calls `testSource` and updates the badge.
- Clicking a source opens a schema-discovery panel: checkboxes for which
  fields/tables to collect (per Unit 04/05/06's `discoverSchema` output),
  "Run collection" confirms the selection and calls `startCollection`.

### Run history table

- Columns: run ID (mono), source, status (badge), duration, record count,
  error count, started at.
- Clicking a row expands to show the run's error list (from Unit
  04/05/06's error tracking) and a "preview normalized records" link that
  shows a few `canonical_events` produced by that run (from Unit 07),
  each showing its provenance (raw record + run).

### Polling

- Simple `setInterval`-based polling (every 2s) while a run's status is
  `running`, stopping once it reaches `succeeded`/`failed`. No websockets
  — out of scope per `project-overview.md`.

## Dependencies

- None new (uses `lucide-react` from Unit 01, Tailwind tokens from
  `ui-context.md`).

## Verify when done

- [ ] Manager can register and successfully test all three required
      sources from this page
- [ ] Schema discovery panel correctly reflects each source's actual
      discoverable fields/tables
- [ ] Running collection shows live status via polling and lands on
      succeeded/failed correctly
- [ ] Run history table shows accurate counts and errors, matching what
      curl against the API shows directly
- [ ] Provenance preview correctly links a normalized record to its exact
      source record and run
- [ ] Responsive at both desktop and a reasonable tablet width (mobile
      polish not required for an internal ops tool)
- [ ] No console errors, no TypeScript errors
- [ ] `npm run build` passes
- [ ] `progress-tracker.md` updated: Unit 09 moved to Completed
