# syntax=docker/dockerfile:1
FROM node:22-slim AS builder
ARG APP
ARG ASSET_PREFIX=/
ENV ASSET_PREFIX=${ASSET_PREFIX}
RUN corepack enable
WORKDIR /app

COPY . .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm --filter "${APP}" build

FROM nginx:1.27-alpine AS runner
ARG APP
ARG SUBPATH=""
COPY docker/app.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/${APP}/dist/ /usr/share/nginx/html/${SUBPATH}
EXPOSE 80
