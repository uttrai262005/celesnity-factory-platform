# Unit 01: Monorepo Setup

## Goal

A working monorepo with `apps/api` (NestJS 11, TypeScript strict) and
`apps/web` (Next.js 16, React 19) that both build and run empty, plus
shared tooling (ESLint, TS config, Prettier). No business logic yet.

## Design

No UI decisions in this unit — this is scaffolding only.

## Implementation

### Repo root

- `package.json` with npm workspaces: `apps/*`.
- Root `tsconfig.base.json` with `strict: true`, extended by each app.
- Root `.gitignore` (node_modules, .env, dist, .next).
- `.env.example` listing every env var that will be needed across the
  whole project (fill in as later units introduce them — start with
  `DATABASE_URL`, `API_PORT`, `WEB_PORT`).

### apps/api

- `nest new api` equivalent structure, NestJS 11, Node.js 22+ engine
  pinned in `package.json`.
- Empty `AppModule` with a single `GET /health` endpoint returning
  `{ status: 'ok' }`.
- Prisma installed, `schema.prisma` created but with no models yet beyond
  a placeholder — real models come in Units 03–08 as each storage need
  arises.

### apps/web

- `create-next-app` equivalent, Next.js 16, App Router, TypeScript,
  Tailwind CSS configured with the tokens from `context/ui-context.md`
  as CSS custom properties in `globals.css`.
- A placeholder home page linking to `/data-sources` and
  `/production-lines` (both 404 for now — built in Units 09–10).

## Dependencies

- `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` (api)
- `prisma`, `@prisma/client` (api)
- `zod` (api, for input validation per code-standards.md)
- `next`, `react`, `react-dom` (web)
- `tailwindcss` (web)
- `lucide-react` (web, per ui-context.md)

## Verify when done

- [ ] `npm run build` passes in `apps/api`
- [ ] `npm run build` passes in `apps/web`
- [ ] `GET /health` on the api returns `{ status: 'ok' }`
- [ ] Web app home page renders with no console errors
- [ ] No TypeScript errors in either app
- [ ] `progress-tracker.md` updated: Unit 01 moved to Completed
