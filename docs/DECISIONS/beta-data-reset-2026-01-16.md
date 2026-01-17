# Beta Data Reset & Address Reconciliation

**Decision:** ONE-TIME ADDRESS DATA RESET
**Executed:** 2026-01-16
**Status:** Complete

---

## Context

ScratchAndDentFinder was in **beta** with:
- No claimed stores
- No users
- No payments
- No contractual obligations

Recent fixes had corrected the ingestion and merge system:
- State-preserving address normalization
- Full FK repointing during merges (claims, events, leads, subs, rate limits)
- Archive-aware query resolution
- Slug redirect handling for merged stores

**This unlocked a one-time data foundation reset that would be unsafe after launch.**

---

## Problem

Legacy address hashing did NOT include state codes, causing:
- Potential cross-state collisions (same street/city in different states)
- Inconsistent duplicate detection
- Address hashes without geographic context

Additional issues:
- Some stores had doubled ZIP codes in address field (e.g., "02903 02903")
- Missing or invalid ZIP codes needed attention

---

## Decision

Perform a controlled database reset of derived address data to:
1. Rebuild all address hashes with state-aware normalization
2. Fix any doubled/malformed ZIP codes
3. Detect and merge any resulting duplicates
4. Update city/state counts

---

## Execution Summary

### Phase 0: Safety Snapshot
- Created: `/tmp/sdf-beta-reset/stores-snapshot-2026-01-16T*.json`
- Total stores captured: 3,659 (3,397 active, 262 archived)

### Phase 1: Address Cleanup
- Doubled ZIPs fixed: 0 (none found)
- ZIPs extracted from address: 0 (addresses don't contain embedded ZIPs)
- Invalid ZIPs cleared: 0
- ZIP coverage: 2,689/3,659 (73.5%)
- **Note:** Phase 1.3 (reverse geocode ZIP backfill) deferred to future sprint

### Phase 2: Address Hash Rebuild
- All 3,659 stores rehashed with state-aware normalization
- Hash function now appends 2-letter state code to prevent cross-state collisions

### Phase 3: Duplicate Detection & Merge
- Address hash duplicate groups found: **0**
- Phone duplicate groups: 0
- Name+city soft matches: 51 (informational only)
- **No merges required**

### Phase 4: Verification
- Counts recomputed (1 city, 1 state updated)
- Verification passed

---

## Results

| Metric | Before | After |
|--------|--------|-------|
| Total stores | 3,659 | 3,659 |
| Active stores | 3,397 | 3,397 |
| Address hash coverage | 100% | 100% |
| ZIP coverage | 73.5% | 73.5% |
| Duplicate groups | Unknown | **0** |

**Outcome:** The new state-aware address hashing resulted in zero duplicate groups. This validates that the normalization algorithm is working correctly and that the existing data was already clean.

---

## Scripts Modified

| Script | Change |
|--------|--------|
| `scripts/backfill-address-hash.ts` | Added dotenv loading |
| `scripts/detect-duplicates.ts` | Added dotenv loading + pagination |
| `scripts/merge-duplicates.ts` | Added dotenv loading + pagination |
| `scripts/counts-recompute.ts` | Added dotenv loading, dynamic import |

## Scripts Created

| Script | Purpose |
|--------|---------|
| `scripts/beta-reset-snapshot.ts` | Export stores table before mutations |
| `scripts/beta-reset-address-cleanup.ts` | Fix doubled ZIPs, clean addresses |

---

## Post-Reset Guardrail

> **After the first claimed store or public launch, hard resets of address or identity data are FORBIDDEN.**
>
> Future corrections must use:
> - Reconciliation scripts (append-only)
> - Soft merges with full audit trail
> - No bulk rewrites of identity fields

---

## Verification Checklist

- [x] Snapshot file exists with all stores
- [x] No doubled ZIPs in address field
- [x] All stores have `address_hash` (100% coverage)
- [x] No duplicate active stores by address_hash (0 groups)
- [x] City/state counts are accurate
- [x] ADR document created

---

## Future Work

- [ ] Phase 1.3: Reverse geocode ZIP backfill for stores without ZIP
- [ ] Consider periodic duplicate detection as part of ingestion pipeline
