# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Unit 01 complete — ready to begin Unit 02.

## Current Goal

- Set up the monorepo skeleton and Docker Compose baseline (Unit 01–02).

## Completed

- Unit 01: Monorepo setup - npm workspaces, empty NestJS health API, Prisma
  placeholder, and Next.js/Tailwind web shell verified.

## In Progress

- None yet.

## Next Up

- Unit 02: Docker Compose skeleton

## Open Questions

- Exact stale-time default is specified by the brief as 15 minutes,
  configurable — confirm the config mechanism (env var vs. DB setting) in
  Unit 08.
- No real Celesnity fixture format was provided — the exact JSON shape of
  the Application API and supplier portal is our own invention,
  documented in the relevant spec files (03, 05).

## Architecture Decisions

- Decided to invent a plausible Celesnity-style architecture rather than
  guess at a real internal repo, since none was provided. Documented as an
  explicit assumption for the graders (see `00-MASTER-PLAN.md`).
- Decided against a job queue (BullMQ, etc.) for collection runs — the
  brief only requires manual, on-demand runs, so an in-process NestJS
  service triggered by a REST call is sufficient and keeps scope tight.
- Decided against shadcn/ui to save setup time; plain Tailwind + a small
  internal component set instead.

## Session Notes

- Start every new session by reading this file plus
  `context/architecture.md` before touching code.
- Build order follows `context/specs/00-build-plan.md` — do not reorder
  units without updating that file first.
