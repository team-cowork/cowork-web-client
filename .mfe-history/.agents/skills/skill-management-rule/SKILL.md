---
name: skill-management-rule
description: Rules for managing skill files. Apply when adding, modifying, or deleting skills. Use when creating skills, editing skills, removing skills, or asking about the .agents/.claude directory structure.
---

# Agents & Skills Management Rules

> **Always write skills in `.agents/` first, then create a symbolic link in `.claude/`.**

`.agents/` is the source of truth. `.claude/` is the entry point Claude Code reads.  
Never write files directly into `.claude/`.

## Add a new skill

```bash
mkdir -p .agents/skills/<skill-name>/reference
# Write SKILL.md and reference files, then:
ln -s ../../.agents/skills/<skill-name> .claude/skills/<skill-name>
```

## Modify an existing skill

Edit files directly inside `.agents/skills/<skill-name>/`.  
Changes are automatically reflected in `.claude/` via the symbolic link.

## Delete a skill

```bash
rm .claude/skills/<skill-name>
rm -rf .agents/skills/<skill-name>
```

## Verify a link

```bash
ls -la .claude/skills/<skill-name>
# Expected: .claude/skills/<skill-name> -> ../../.agents/skills/<skill-name>
```
