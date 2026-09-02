# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
ARG PNPM_VERSION=11.6.0
ARG SHARP_VERSION=0.34.5

FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
RUN apk add --no-cache libc6-compat \
 && npm install -g pnpm@${PNPM_VERSION}
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:${NODE_VERSION}-alpine AS sharp
ARG SHARP_VERSION
WORKDIR /sharp
RUN npm init --yes > /dev/null \
 && npm install --omit=dev sharp@${SHARP_VERSION}

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=sharp --chown=node:node /sharp/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "server.js"]
