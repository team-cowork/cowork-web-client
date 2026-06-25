# syntax=docker/dockerfile:1

# 앱 공용 Dockerfile. 빌드 컨텍스트는 레포 루트(워크스페이스 의존성 때문).
# 빌드 인자:
#   APP          - 빌드할 워크스페이스 패키지명 (예: cowork-chat, shell)
#   ASSET_PREFIX - 정적 에셋이 서빙될 경로 (예: /_mf/chat/, shell 은 /)
#   SUBPATH      - dist 를 배치할 nginx 하위 경로 (예: _mf/chat/, shell 은 빈값)

# ---- builder: 특정 앱을 정적 빌드 ----
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

# ---- runner: nginx 로 dist 정적 서빙 ----
FROM nginx:1.27-alpine AS runner
ARG APP
ARG SUBPATH=""
COPY docker/app.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/${APP}/dist/ /usr/share/nginx/html/${SUBPATH}
EXPOSE 80
