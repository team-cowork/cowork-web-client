# Commit Scope Selection Guide

## Priority Rule

**App + Layer > Layer only > global**

Always use `<app-name>/<layer>` for changes inside `apps/`. Only use `<layer>` alone for `packages/`. Use `global` only when the change is outside both `apps/` and `packages/`.

## Scope by Location

### `apps/` — MFE Apps (Primary)

Format: `<app-name>/<layer>`

| App              | When to use               |
| ---------------- | ------------------------- |
| `cowork-chat`    | Chat features             |
| `cowork-issue`   | Issue tracking features   |
| `cowork-profile` | User profile features     |
| `shell`          | Host app, layout, routing |

### FSD Layers

| Layer      | When to use                                          |
| ---------- | ---------------------------------------------------- |
| `app`      | App initialization, providers, global config         |
| `pages`    | Page-level components and routing                    |
| `widgets`  | Composite UI blocks assembled from features/entities |
| `features` | User interactions, business logic slices             |
| `entities` | Business entities, models, schemas                   |
| `shared`   | Reusable UI kit, utilities, constants, API clients   |

### `packages/` — Shared Packages (Layer only)

Format: `<layer>`

| Package             | Typical layer scope |
| ------------------- | ------------------- |
| `ui`                | `shared`            |
| `eslint-config`     | `shared`            |
| `typescript-config` | `shared`            |

### Outside `apps/` and `packages/`

| Scope    | When to use                                              |
| -------- | -------------------------------------------------------- |
| `global` | Root config, turbo.json, pnpm-workspace, CI/CD pipelines |

## Wrong vs Correct Examples

| Wrong                                             | Correct                                                    | Reason                                  |
| ------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| `feat(global): 메시지 입력 컴포넌트 추가`         | `feat(cowork-chat/features): 메시지 입력 컴포넌트 추가`    | Change is inside cowork-chat app        |
| `fix(cowork-issue): 이슈 상태 업데이트 버그 수정` | `fix(cowork-issue/entities): 이슈 상태 업데이트 버그 수정` | Layer must be specified for MFE changes |
| `refactor(shared): 공통 버튼 컴포넌트 개선`       | `refactor(shared): 공통 버튼 컴포넌트 개선`                | Correct — change is in `packages/ui`    |

## Correct `global` Usage

```
chore(global): pnpm-workspace 패키지 경로 추가
ci/cd(global): GitHub Actions 워크플로우 최적화
refactor(global): turbo.json 태스크 파이프라인 정리
```
