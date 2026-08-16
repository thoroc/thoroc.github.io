#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
INDEX="$ROOT/.context/index.yaml"
THRESHOLD_DAYS="${PLAN_STALENESS_THRESHOLD_DAYS:-60}"

python3 - "$INDEX" "$THRESHOLD_DAYS" <<'PYEOF'
import re
import sys
from datetime import date
from pathlib import Path

index_path = Path(sys.argv[1])
threshold = int(sys.argv[2])

if not index_path.exists():
    print("context index not found, skipping plan-staleness check", file=sys.stderr)
    sys.exit(0)

text = index_path.read_text()

entries = []
current_section = None
current = {}
for line in text.splitlines():
    section_match = re.match(r"^(plans|follow-ups):\s*$", line)
    if section_match:
        if current:
            entries.append((current_section, current))
            current = {}
        current_section = section_match.group(1)
        continue
    if re.match(r"^[a-z-]+:\s*$", line) and not line.startswith(" "):
        if current:
            entries.append((current_section, current))
            current = {}
        current_section = None
        continue
    if current_section is None:
        continue
    m = re.match(r'^\s*- path: "(.+)"', line)
    if m:
        if current:
            entries.append((current_section, current))
        current = {"path": m.group(1)}
        continue
    m = re.match(r'^\s*title: "(.+)"', line)
    if m:
        current["title"] = m.group(1)
        continue
    m = re.match(r"^\s*status: (\S+)", line)
    if m:
        current["status"] = m.group(1)
        continue
    m = re.match(r"^\s*date: (\S+)", line)
    if m:
        current["date"] = m.group(1)
        continue
if current:
    entries.append((current_section, current))

stale = []
today = date.today()
for section, e in entries:
    if e.get("status") != "active":
        continue
    try:
        d = date.fromisoformat(e["date"])
    except (KeyError, ValueError):
        continue
    age = (today - d).days
    if age > threshold:
        stale.append((e["path"], e.get("title", ""), age))

if stale:
    print(f"NOTICE: {len(stale)} active plan(s)/follow-up(s) older than {threshold} days (advisory, non-blocking):")
    for path, title, age in sorted(stale, key=lambda x: -x[2]):
        print(f'  {path} ({age}d old): "{title}"')
    print()
    print("Age alone does not mean a plan is wrong, but check whether recent commits already satisfy its scope")
    print("under a different name before leaving it active. See ways-of-working.md, 'Keeping plans in sync'.")

# Advisory only, matching the journal-tag-lint precedent: always exit 0.
sys.exit(0)
PYEOF
