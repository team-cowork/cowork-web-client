---
name: commit
description: Create Git commits by splitting changes into logical units following project conventions. Handles Git Flow automatically — detects develop branch and checks out a feature branch before committing.
allowed-tools: Bash
---

## Step 0 — Branch Check (Required)

Check the current branch first:

```bash
git branch --show-current
```

**If current branch is `develop`:**

This project uses Git Flow. Feature branches must be created from `develop` and merged back into `develop`.

1. Analyze all changes with `git status` and `git diff`
2. Infer an appropriate branch name from the changes:
   - Format: `<type>/<kebab-case-description>` — use the same type as the planned commit (exception: use `cicd/` for `ci/cd` type)
   - Reflect the MFE app and domain in the name
   - Examples: `feat/cowork-chat-message-input`, `fix/cowork-issue-status-update`, `refactor/shell-shared-layout`
3. Create and checkout the branch:
   ```bash
   git checkout -b <type>/<inferred-name>
   ```
4. Proceed with the commit flow below

**If current branch is NOT `develop`:** proceed directly to the commit flow.

---

## Commit Message Rules

Format: `type(scope): 설명`

- **Types**: `feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` / `perf` / `ci/cd` (English)
- **Scopes** (English):
  - MFE under `apps/` → `<app-name>/<layer>` (e.g. `cowork-chat/features`)
  - Package under `packages/` → `<layer>` (e.g. `shared`)
  - Outside `apps/` and `packages/` → `global`
- **FSD Layers**: `app` / `pages` / `widgets` / `features` / `entities` / `shared`
- **MFE Apps**: `cowork-chat` / `cowork-issue` / `cowork-profile` / `shell`
- **Description**: Korean, no period, avoid endings: `~한다/~된다`, `~하기/~하기 위해`, `~합니다/~됩니다`, `~했습니다`
  - Good examples: `메시지 입력 컴포넌트 추가`, `이슈 상태 업데이트 버그 수정`, `공통 레이아웃 분리`
- Subject line only (no body)
- Do NOT add AI tool as co-author

## Scope Selection

For the full scope selection guide and examples, read `references/scope-guide.md`.

Quick rule: use `<app-name>/<layer>` by default. Only use `<layer>` alone for `packages/`, and `global` for root-level cross-cutting changes.

## Commit Flow

1. Inspect changes: `git status`, `git diff`
2. Categorize into logical units (feature / bug fix / refactoring / etc.)
3. Group files per unit
4. For each group:
   - Stage only relevant files with `git add`
   - Write a commit message following the rules above
   - `git commit -m "message"`
5. Verify with `git log --oneline -n <count>`
