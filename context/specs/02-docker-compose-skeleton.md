# Unit 02: Docker Compose Skeleton

## Goal

`docker compose up` starts Postgres, `apps/api`, and `apps/web` together,
all able to reach each other by service name. Mosquitto and fixture
services are added in later units (05, 06, 11) but the file structure is
ready for them.

## Design

No UI decisions in this unit.

## Implementation

### docker-compose.yml

- `postgres` service: `postgres:16`, volume for data persistence, exposes
  5432, env vars for db name/user/password matching `.env.example`.
- `api` service: builds from `apps/api/Dockerfile`, depends_on postgres
  (with a healthcheck condition, not just start order), reads
  `DATABASE_URL` pointing at the `postgres` service name.
- `web` service: builds from `apps/web/Dockerfile`, depends_on api,
  reads the api's internal URL for server-side calls.
- Named network so all services resolve each other by service name.

### Dockerfiles

- `apps/api/Dockerfile`: multi-stage, Node 22 base, build then run
  `dist/main.js`.
- `apps/web/Dockerfile`: multi-stage, Node 22 base, `next build` then
  `next start`.

### Prisma migration on boot

- `apps/api` runs `prisma migrate deploy` on container start (via an
  entrypoint script) before starting the Nest app, so a fresh
  `docker compose up` always has an up-to-date schema.

## Dependencies

- None new beyond Docker itself.

## Verify when done

- [ ] `docker compose up` starts all three services with no crash loop
- [ ] `apps/api` can connect to `postgres` using the service name as host
- [ ] `apps/web` can reach `apps/api`'s `/health` endpoint from inside the
      Docker network
- [ ] Restarting the stack does not lose Postgres data (volume works)
- [ ] `progress-tracker.md` updated: Unit 02 moved to Completed
