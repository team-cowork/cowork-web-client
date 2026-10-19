---
name: pull-request
description: 'Generate a repo-compliant PR title and body, then create a draft GitHub pull request targeting `develop` for this monorepo.'
allowed-tools: Bash
---

# Pull Request

Use this skill when the user wants to create a pull request for the current branch in this repository.

## Source of truth

1. Read `.github/PULL_REQUEST_TEMPLATE.md` first.
2. The PR body must preserve the template headings exactly:

```md
## 개요

...

## 본문

...
```

## Preconditions

1. Check the repository state:
   - `git status -sb`
   - `git branch --show-current`
   - `git remote -v`
2. Check GitHub CLI availability:
   - `gh --version`
   - `gh auth status`
3. If `gh` is missing, unauthenticated, or the repository is not connected to GitHub, stop and explain the blocker.

## Branch and diff rules

1. Default target branch is `develop`.
2. If the current branch is `develop`, stop and tell the user to create a working branch first.
3. Inspect recent context before drafting the PR:
   - `git log origin/develop..HEAD --oneline 2>/dev/null || git log --oneline -15`
   - `git diff origin/develop...HEAD --stat 2>/dev/null || git diff HEAD~5...HEAD --stat`
   - `git diff origin/develop...HEAD 2>/dev/null || git diff HEAD~5...HEAD`
4. If the worktree contains unrelated changes, do not silently include them in the PR.

## Title rules

1. Generate one final title in the format `[scope] 한국어 설명`.
2. Allowed scopes are only:
   - `[cowork-chat]`
   - `[cowork-issue]`
   - `[cowork-profile]`
   - `[shell]`
   - `[ui]`
   - `[global]`
   - `[ci/cd]`
3. Use the narrowest scope that matches the changed area.
4. Use `[global]` for root-level, shared, or multi-app changes that are not CI-specific.
5. Use `[ci/cd]` only for CI workflow, automation, or pipeline changes.
6. Wrap technical identifiers in backticks when they appear in the title.
7. Do not use emojis.

## Body rules

1. Draft the body from the actual diff and recent commits, not from a raw file list.
2. Write `개요` in 1 to 3 sentences.
3. Write `본문` as a more detailed explanation of what changed and why.
4. Use Korean formal prose in `~하였습니다` style.
5. Do not use emojis.
6. Wrap technical identifiers in backticks throughout the body.
7. Keep the full PR body within 2500 characters.
8. If the implementation is clear but the intent is missing, ask the user a short follow-up instead of inventing rationale.

## Creation flow

1. Confirm the branch and diff context.
2. Generate the final title and body under the rules above.
3. Write the body to a temporary Markdown file with real newlines.
4. Show the generated title and body preview before creation.
5. Create a draft PR against `develop` by default with:

```bash
bash ".agents/skills/pull-request/scripts/create-pull-request.sh" "<title>" "<body-file>" "develop"
```

6. If the user explicitly asks for another base branch, pass that branch as the third argument.
7. After creation, report the PR URL, title, base branch, and any validation performed.

## Safety rules

- Never rewrite the template headings.
- Never violate the required title format `[scope] 한국어 설명`.
- Never exceed the 2500-character body limit.
- Never create a PR from `develop`.
- Never create a ready-for-review PR unless the user explicitly asks for it.
