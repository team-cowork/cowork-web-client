#!/bin/bash
set -euo pipefail

TITLE="${1:?Error: PR title is required. Usage: create-pull-request.sh <title> <body-file> [base-branch]}"
BODY_FILE="${2:?Error: Body file is required. Usage: create-pull-request.sh <title> <body-file> [base-branch]}"
BASE="${3:-develop}"

if [ ! -f "$BODY_FILE" ]; then
  echo "ERROR: Body file not found: $BODY_FILE" >&2
  exit 1
fi

CURRENT=$(git branch --show-current)
if [ -z "$CURRENT" ]; then
  echo "ERROR: Could not determine the current branch." >&2
  exit 1
fi

if [ "$CURRENT" = "develop" ]; then
  echo "ERROR: Do not create a PR from 'develop'. Create a working branch first." >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: 'gh' is not installed." >&2
  exit 1
fi

ARGS=(gh pr create --draft --title "$TITLE" --body-file "$BODY_FILE" --base "$BASE")

echo "Creating PR..."
echo "  Branch: $CURRENT"
echo "  Title : $TITLE"
echo "  Base  : $BASE"
echo ""

"${ARGS[@]}"
