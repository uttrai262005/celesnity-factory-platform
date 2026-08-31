FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY apps/web/next.config.ts ./apps/web/next.config.ts
COPY apps/web/next-env.d.ts ./apps/web/next-env.d.ts
COPY apps/web/postcss.config.mjs ./apps/web/postcss.config.mjs
COPY apps/web/app ./apps/web/app
COPY apps/web/app/globals.css ./apps/web/app/globals.css
COPY apps/web/app/layout.tsx ./apps/web/app/layout.tsx
COPY apps/web/app/page.tsx ./apps/web/app/page.tsx

RUN npm install
RUN npm run build --workspace @celesnity/web

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache curl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package*.json ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/next.config.ts
COPY --from=builder /app/apps/web/app ./apps/web/app

WORKDIR /app/apps/web
EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
