# Governance Decisions

Explicit decisions about what we chose NOT to build, and why.

---

## slice-init CLI — Intentionally NOT Implemented

**Date:** 2026-01-13

**Decision:** Do not implement a `slice-init` CLI tool.

**Reason:**
- Single-project scope
- Few contributors
- Enforcement already exists at slice closure (`gate-decision-check.ts`)
- Avoids template duplication and governance drift
- Manual workflow (copy template → fill in) is sufficient

**Current workflow:**
1. Copy `docs/slices/SLICE_CLOSURE_TEMPLATE.md`
2. Rename to `Slice-N.md` or `slice-N-<name>.md`
3. Fill in sections
4. Run `npx tsx scripts/gate-decision-check.ts <file>`
5. Run `npx tsx scripts/gates-verify.ts`

**Re-evaluate if:**
- Contributors > 3
- Multiple repos adopt this governance model
- Filename convention enforcement becomes necessary

**If implemented later:**
- Must read `SLICE_CLOSURE_TEMPLATE.md` verbatim
- String substitution only (slice number, name, date)
- Never embed structure
- Never renumber sections

---

*This document records intentional non-decisions. Choosing not to build something is itself a governance decision.*
