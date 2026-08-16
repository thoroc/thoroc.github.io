# Agent Rules

Project-level agent behavioural rules. This is the authoritative source all agents read before acting in this
repository. See `.agents/skills/rules-management/` for how entries are added and validated.

## Rule: Use a git worktree for every new branch

**Directive:** ALWAYS create a new git worktree under .claude/worktree/ before creating and checking out a new branch, rather than switching branches in the primary working directory. Run `mise trust` inside the new worktree immediately after creating it (mise treats each worktree path as a separate untrusted config and pre-commit hooks fail otherwise). Remove the worktree (git worktree remove) once its branch is merged.

**Rationale:** Multiple agent sessions can operate in this same repository checkout concurrently; switching branches in-place risks one session's checkout being changed out from under another mid-task (observed 2026-08-03 on MR !92, where an unrelated risk-register row from earlier session state got swept into an unrelated commit). A dedicated worktree per branch isolates each session's working tree so branch switches and commits in one session cannot affect another.

## Rule: Check whether a skill is vendored before deciding where a fix lives

**Directive:** Before amending or extending the behaviour of a `.agents/skills/<name>` skill, run `git log --oneline --diff-filter=A -- .agents/skills/<name>/SKILL.md` (or check the skill's addition commit) to determine whether it was hand-vendored from an external source (e.g. `chore(skills): vendor Claude Code skills under .claude/skills`, "Sourced from the pantheon-org skill set") or authored natively in this repo. For a **vendored** skill, put the project-specific refinement in `.agents/RULES.md` instead of editing the skill file directly -- a hand-edit is silently lost the next time it is re-vendored (per that commit's own "hand-vendored copies; upstream updates must be re-vendored" note). For a **native** skill, amend the skill's own rules/SKILL.md directly, matching this repo's existing pattern of citing the incident that prompted each rule (e.g. mr-review's Rules 2-4, each added after a real MR incident).

## Rule: Treat incomplete or mismatching documentation as urgent tech debt

**Directive:** ALWAYS log incomplete or mismatching documentation (a doc that no longer matches the code, or is missing content a change should have added) as a docs/TECH_DEBT.md row under Area "Code quality", but treat it as urgent: fix it in the same session it is discovered rather than leaving Status: Open for later spare-time cleanup like a routine tech-debt row. Do not route it to docs/RISK_REGISTER.md merely to avoid this urgency -- it still belongs in TECH_DEBT.md, just fixed immediately instead of deferred.

**Rationale:** Stale or mismatched documentation actively misleads the next reader -- human or agent -- into following wrong guidance, and the cost compounds with every reader who trusts it before it's caught (e.g. the Cliffy/@agents-radar content found in typescript-standards.md on 2026-08-05, referencing a library and package that don't exist anywhere in this repo). That makes it categorically different from ordinary code-quality cleanup, which is genuinely fine to defer.

## Rule: Create a handover file on session handover

**Directive:** ALWAYS create a handover file under .context/handover/<date>-<slug>.md when handing over a session to another agent or human, before concluding the work.

**Rationale:** Handovers need a durable, discoverable resume point; a dated handover file under .context/handover/ gives the next session the current state, what was tried, and what remains without re-discovery.
