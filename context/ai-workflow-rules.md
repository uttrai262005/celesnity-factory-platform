# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. The files in
`context/` define what to build, how to build it, and the current state of
progress. Every unit of work is implemented against a spec file in
`context/specs/`. Never infer or invent product behavior that isn't written
in `project-overview.md` or a spec file — this assessment is graded partly
on decision clarity, so undocumented improvisation is a liability, not a
feature.

## Scoping Rules

- Work on exactly one spec file (`context/specs/NN-*.md`) at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation
  step (e.g. do not touch `collectors/` and `production/` in the same
  change).
- Do not start a collector for a source type that doesn't have a fixture
  yet — the fixture is a dependency, build it first (see build plan).

## When to Split Work

Split an implementation step if it combines:

- Backend logic and frontend wiring for the same feature (build the API
  route and prove it with curl/Postman first, then wire the UI in a
  separate step)
- Two different collector types in one change
- A schema/migration change together with the feature that depends on it
  (migration is its own small step)
- Anything not clearly defined in `project-overview.md` — if it's not
  written down, it doesn't get built yet

If a change cannot be verified end-to-end in under ~15 minutes of manual
testing, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files or the
  original assessment brief.
- If a requirement is ambiguous (e.g. exact freshness threshold, exact
  crawler pagination shape), make the smallest reasonable assumption,
  write it explicitly into `progress-tracker.md` under "Architecture
  Decisions," and keep moving — do not block on it.
- If a requirement is genuinely missing and blocks progress, add it to
  "Open Questions" in `progress-tracker.md` before continuing to the next
  unit.

## Protected Files

Do not modify the following unless explicitly instructed:

- `context/*.md` — these are edited deliberately, not as a side effect of
  a code change, except `progress-tracker.md` which is updated after every
  unit by design.
- `fixtures/` seed data, once a unit that depends on it has been verified
  — changing fixture data after the fact silently breaks earlier
  verification.
- Prisma migration files that have already been applied — create a new
  migration instead of editing an old one.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- New system boundary or folder → update `architecture.md`
- New storage table or field → update `architecture.md` storage model
- New coding convention adopted mid-build → update `code-standards.md`
- Feature scope changes (e.g. MQTT gets cut) → update `project-overview.md`
  scope section

## Before Moving to the Next Unit

1. The current unit works end-to-end within its defined scope (verified
   manually, not just "it compiles").
2. No invariant defined in `architecture.md` was violated.
3. `progress-tracker.md` reflects the completed work, including any
   assumptions made.
4. `npm run build` passes in both `apps/api` and `apps/web`.
5. If the unit touched a collector, the run's error list correctly shows
   at least one deliberately-triggered failure case (timeout, malformed
   row) handled gracefully — not just the happy path.
