# SLICE CLOSURE TEMPLATE

This document formally closes a slice.
A slice is not complete until this document exists and is committed.

---

## 1. Slice Identification

- Slice Number:
- Slice Name:
- Date Closed:
- Last Commit SHA:
- Author:

---

## 2. Intent (What this slice set out to do)

Briefly state the purpose of the slice in one or two sentences.

---

## 3. Scope Summary

### In Scope
- …

### Out of Scope
- …

---

## 4. Result Summary

Describe what is now true that was not true before this slice.
Focus on observable system behavior.

---

## 5. Gate Impact Summary

### Existing Gates
- List all existing gates affected or relied upon.
- Confirm they continue to pass unchanged.

### New Gates Introduced
- ☐ None
- ☐ Yes → List gate number(s) and name(s)

---

## 6. Gate Decision (Required)

⚠️ **This section is mandatory for every slice. Do not remove.**

### 6a. Failure Mode Analysis

Answer briefly.

- What could go wrong if this slice were incorrect?
- Would failure be silent or obvious?
- Would failure affect trust, SEO, data integrity, or determinism?

---

### 6b. Gate Decision Matrix

Answer **Yes / No** to each:

- Does this slice allow untrusted data to become public?
- Does it introduce irreversible data mutation?
- Does it modify URL structure, canonicals, or routing?
- Does it affect sitemap composition or crawlable surfaces?
- Does it bypass or weaken an adapter boundary?
- Does it rely on human discipline instead of code enforcement?
- Does it introduce external system coupling with risk of drift?

---

### 6c. Decision

- ☐ New gate required
- ☐ No new gate required

**Justification (required):**

Explain why existing gates are sufficient **or** why a new permanent invariant is necessary.

> "No new gate required" is a valid outcome — but must be justified.

---

## 7. Verification Evidence

List how correctness was verified.

- Gates run:
- Manual checks:
- Diff comparisons (if applicable):

---

## 8. Non-Changes (Important)

Explicitly list what this slice did **not** change.

Examples:
- No new routes
- No DB schema changes
- No SEO surface changes
- No trust boundary changes

---

## 9. Closure Statement

This slice is considered **closed** when:

- This document exists
- All referenced gates pass
- No unresolved risks remain

**Definition of Done satisfied:** ☐ Yes

---

## 10. Sign-off

- Author:
- Date:
