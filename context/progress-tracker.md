# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Unit 03 complete — ready to begin Unit 04.

## Current Goal

- Set up the monorepo skeleton and Docker Compose baseline (Unit 01–02).

## Completed

- Unit 01: Monorepo setup - npm workspaces, empty NestJS health API, Prisma
  placeholder, and Next.js/Tailwind web shell verified.
- Unit 02: Docker Compose skeleton - postgres + api + web service wiring,
  Dockerfiles for both apps, Prisma migrate-deploy bootstrapping for the API
  container, and all four runtime verification checks passed: startup,
  API-to-Postgres service-name connectivity, web-to-API /health reachability,
  and Postgres data persistence across a restart.
- Unit 03: Application API fixture - standalone Express fixture server,
  pagination across all four endpoints, failure-header simulation for timeout
  and 500-once behavior, Docker Compose service wiring, and verification via
  live curl checks.

## In Progress

- None.

## Next Up

- Unit 04: Application API collector

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
