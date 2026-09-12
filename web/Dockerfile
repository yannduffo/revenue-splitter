# syntax=docker/dockerfile:1

# ----------- deps : cached as long as lockfile doesn't change
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ----------- builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# inlined into the client bundle by 'next build' : must be here, not at runtime
ARG NEXT_PUBLIC_CHAIN
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SEPOLIA_FACTORY
ARG NEXT_PUBLIC_SEPOLIA_FACTORY_BLOCK
ARG NEXT_PUBLIC_SEPOLIA_DEMO_SPLITTER_A
ARG NEXT_PUBLIC_SEPOLIA_DEMO_SPLITTER_B
ARG NEXT_PUBLIC_SEPOLIA_DEMO_TOKENS

RUN npm run build

# ---------- runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

#standalone server.js does not bundle /app/public & ./public
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
