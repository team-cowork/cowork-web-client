**Please respond and work in Korean.**

# Cowork Web Client

## Project Structure

This project is a micro frontend architecture with multiple tech.

## Coding Conventions

### Commit Conventions

Format: `type(scope): 설명`

- Types: `feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` / `perf` / `ci/cd`
- Scope:
  - MFE under `apps/` → `<app-name>/<layer>` (e.g. `cowork-chat/shared`)
  - Package under `packages/` → `<layer>` (e.g. `shared`)
  - Outside `apps/` and `packages/` → `global` (CI/CD, root config, etc.)
- Layers: `app` / `pages` / `widgets` / `features` / `entities` / `shared`
- Description: Korean, no period
