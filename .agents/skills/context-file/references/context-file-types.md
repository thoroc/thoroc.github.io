# .context/ File Types Reference

This reference documents the four types of `.context/` files and their distinct purposes.

## Plan

Plans document multi-step implementation, migration, or remediation work.

**Location:** `.context/plans/YYYY-MM-DD-<kebab-case-name>.md`

**Required frontmatter fields:** `title`, `type: plan`, `status`, `date`

| Field      | Convention                          | Example                                    |
| ---------- | ------------------------------------ | ------------------------------------------ |
| `title`    | `"Plan: <concise title>"`           | `"Plan: Migrate to Structured Logging"`    |
| `status`   | Start as draft                      | `draft`                                    |
| `filename` | date-first (`YYYY-MM-DD-<slug>.md`) | `2026-06-30-migrate-structured-logging.md` |

**Required sections:** Goal, Steps, Open Questions

## Finding

Findings document research output, code review results, audit findings, and prerequisite investigations.

**Location:** `.context/findings/YYYY-MM-DD-<topic>.md`

**Required frontmatter fields:** `title`, `type: finding`, `status`, `date`, optionally `related`

| Field      | Convention                       | Example                                     |
| ---------- | -------------------------------- | ------------------------------------------- |
| `title`    | `"Finding: <topic>"`             | `"Finding: Database Migration Strategy"`    |
| `status`   | Start as active                  | `active`                                    |
| `related`  | Reference related plans/analyses | `../plans/improve-test-coverage.md`         |
| `filename` | date-first (`YYYY-MM-DD-<slug>.md`) | `2026-06-30-database-migration-strategy.md` |

**Required sections:** One-sentence summary, Summary, Detail, Recommended Action

## Analysis

Analyses document duplication reports, benchmark results, comparative reviews, and one-off audits.

**Location:** `.context/analysis/YYYY-MM-DD-<topic>.md`

**Required frontmatter fields:** `title`, `type: analysis`, `status`, `date`

| Field    | Convention                        | Example                         |
| -------- | --------------------------------- | ------------------------------- |
| `title`  | `"<Topic> Analysis — YYYY-MM-DD"` | `"CLI Flag Audit — 2026-06-30"` |
| `status` | Typically done on creation        | `done`                          |

**Required sections:** Summary, Findings, Conclusion

## Follow-up

Follow-ups capture deferred work or open threads surfaced mid-session but out of scope for the current change — the durable record that lets the _next_ session pick up where this one left off, since
chat context does not survive `/clear`, compaction, or a new session.

**Location:** `.context/follow-ups/YYYY-MM-DD-<topic>.md`

**Required frontmatter fields:** `title`, `type: follow-up`, `status`, `date`, optionally `related`

| Field      | Convention                                                            | Example                                                     |
| ---------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| `title`    | `"Follow-up: <concise description>"`                                  | `"Follow-up: assign a facet to the tooling tag"`            |
| `status`   | Start as active, flip to `done` when actioned — never delete the file | `active`                                                    |
| `related`  | Reference the session/entry that surfaced it                          | `../../2026/07/2026-07-28-biome-prettier-markdown-scope.md` |
| `filename` | date-first (`YYYY-MM-DD-<slug>.md`)                                   | `2026-07-28-journal-tag-taxonomy-tooling.md`                |

**Required sections:** Context, Outstanding Work, Action

**File it the same turn it's identified.** A follow-up mentioned only in a chat reply is indistinguishable from one that was never noticed — the next session has no way to tell the difference.

## Common Mistakes

| Mistake                                 | Fix                                                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Using wrong type for the content        | Match type to subdirectory: plan↔plans/, finding↔findings/, analysis↔analysis/, follow-up↔follow-ups/ |
| Putting plans in `.context/audits/`     | Use `.context/plans/` instead — audits/ is owned by skill-auditor                                     |
| Missing frontmatter that blocks commits | Always start with `---\ntitle:\ntype:\nstatus:\ndate:\n---`                                           |
| Not regenerating the index              | Run `.agents/skills/context-index/regenerate-context-index.sh` after creation                         |
| Mentioning a follow-up in chat only     | File it under `.context/follow-ups/` in the same turn — chat does not persist                         |
